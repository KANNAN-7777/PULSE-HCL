package controllers

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"golang.org/x/crypto/bcrypt"

	"pulse-backend/config"
	"pulse-backend/models"
)

const registrationOTPExpiry = 10 * time.Minute

func generateRegistrationOTP() (string, error) {
	buffer := make([]byte, 4)

	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}

	number := uint32(buffer[0])<<24 |
		uint32(buffer[1])<<16 |
		uint32(buffer[2])<<8 |
		uint32(buffer[3])

	return fmt.Sprintf("%06d", number%1000000), nil
}

func validateEmail(email string) bool {
	email = strings.TrimSpace(email)

	if email == "" || len(email) > 254 {
		return false
	}

	parsed, err := mail.ParseAddress(email)
	if err != nil {
		return false
	}

	return strings.EqualFold(parsed.Address, email)
}

func profileUploadDirectory() string {
	return filepath.Join(".", "uploads", "profiles")
}

func ensureUserIndexes() {
	if config.DB == nil {
		return
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	usersCollection := config.DB.Collection("users")

	_, _ = usersCollection.Indexes().CreateMany(
		ctx,
		[]mongo.IndexModel{
			{
				Keys: bson.D{
					{
						Key:   "email",
						Value: 1,
					},
				},
				Options: options.Index().SetUnique(true),
			},
			{
				Keys: bson.D{
					{
						Key:   "username",
						Value: 1,
					},
				},
				Options: options.Index().SetUnique(true),
			},
		},
	)
}

func InitializeAuthIndexes() {
	ensureUserIndexes()
}

// ============================================================
// REGISTER
// ============================================================

func Register(c *gin.Context) {
	var input struct {
		Name     string `json:"name" form:"name"`
		Username string `json:"username" form:"username"`
		Email    string `json:"email" form:"email"`
		Password string `json:"password" form:"password"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid registration request",
		})
		return
	}

	input.Name = strings.TrimSpace(input.Name)
	input.Username = strings.TrimSpace(input.Username)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	if input.Name == "" || input.Username == "" || input.Email == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "All registration fields are required",
		})
		return
	}

	if len(input.Name) < 2 || len(input.Name) > 80 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Name must contain 2 to 80 characters",
		})
		return
	}

	if len(input.Username) < 3 || len(input.Username) > 30 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Username must contain 3 to 30 characters",
		})
		return
	}

	for _, character := range input.Username {
		validCharacter :=
			(character >= 'a' && character <= 'z') ||
				(character >= 'A' && character <= 'Z') ||
				(character >= '0' && character <= '9') ||
				character == '_' ||
				character == '.'

		if !validCharacter {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Username contains invalid characters",
			})
			return
		}
	}

	if !validateEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Please enter a valid email address",
		})
		return
	}

	if len(input.Password) < 6 || len(input.Password) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Password must contain 6 to 72 characters",
		})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	usersCollection := config.DB.Collection("users")

	var existingUser models.User

	err := usersCollection.FindOne(
		ctx,
		bson.M{
			"$or": []bson.M{
				{"email": input.Email},
				{"username": input.Username},
			},
		},
	).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Email or username already exists",
		})
		return
	}

	if !errors.Is(err, mongo.ErrNoDocuments) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not check existing account",
		})
		return
	}

	otp, err := generateRegistrationOTP()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not generate verification code",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(input.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not secure password",
		})
		return
	}

	now := time.Now()

	registrationCollection := config.DB.Collection("registration_otps")

	_, err = registrationCollection.DeleteMany(
		ctx,
		bson.M{
			"email": input.Email,
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not prepare verification",
		})
		return
	}

	registration := bson.M{
		"name":       input.Name,
		"username":   input.Username,
		"email":      input.Email,
		"password":   string(hashedPassword),
		"otp":        otp,
		"verified":   false,
		"created_at": now,
		"expires_at": now.Add(registrationOTPExpiry),
	}

	_, err = registrationCollection.InsertOne(
		ctx,
		registration,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not save registration",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":               true,
		"message":               "Verification code generated",
		"requires_verification": true,
		"otp":                   otp,
		"email":                 input.Email,
	})
}

// ============================================================
// VERIFY REGISTRATION OTP
// ============================================================

func VerifyRegistrationOTP(c *gin.Context) {
	var input struct {
		Email string `json:"email" form:"email"`
		OTP   string `json:"otp" form:"otp"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid verification request",
		})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.OTP = strings.TrimSpace(input.OTP)

	if !validateEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid email address",
		})
		return
	}

	if len(input.OTP) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Verification code must contain 6 digits",
		})
		return
	}

	for _, character := range input.OTP {
		if character < '0' || character > '9' {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Verification code must contain only digits",
			})
			return
		}
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	registrationCollection := config.DB.Collection("registration_otps")

	var registration struct {
		ID        bson.ObjectID `bson:"_id"`
		Name      string        `bson:"name"`
		Username  string        `bson:"username"`
		Email     string        `bson:"email"`
		Password  string        `bson:"password"`
		OTP       string        `bson:"otp"`
		Verified  bool          `bson:"verified"`
		ExpiresAt time.Time     `bson:"expires_at"`
	}

	err := registrationCollection.FindOne(
		ctx,
		bson.M{
			"email": input.Email,
		},
	).Decode(&registration)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Verification code not found or expired",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not verify registration",
		})
		return
	}

	if time.Now().After(registration.ExpiresAt) {
		_, _ = registrationCollection.DeleteOne(
			ctx,
			bson.M{
				"_id": registration.ID,
			},
		)

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Verification code has expired",
		})
		return
	}

	if registration.OTP != input.OTP {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid verification code",
		})
		return
	}

	usersCollection := config.DB.Collection("users")

	var existingUser models.User

	err = usersCollection.FindOne(
		ctx,
		bson.M{
			"$or": []bson.M{
				{"email": registration.Email},
				{"username": registration.Username},
			},
		},
	).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Email or username already exists",
		})
		return
	}

	if !errors.Is(err, mongo.ErrNoDocuments) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not check account",
		})
		return
	}

	user := models.User{
		ID:       bson.NewObjectID(),
		Name:     registration.Name,
		Username: registration.Username,
		Email:    registration.Email,
		Password: registration.Password,
		Role:     "creator",
	}

	_, err = usersCollection.InsertOne(ctx, user)

	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Email or username already exists",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not create account",
		})
		return
	}

	_, _ = registrationCollection.DeleteOne(
		ctx,
		bson.M{
			"_id": registration.ID,
		},
	)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Account created successfully",
		"user": gin.H{
			"id":              user.ID.Hex(),
			"name":            user.Name,
			"username":        user.Username,
			"email":           user.Email,
			"role":            user.Role,
			"profile_picture": user.ProfilePicture,
		},
	})
}

// ============================================================
// LOGIN
// ============================================================

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" form:"email"`
		Password string `json:"password" form:"password"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid login request",
		})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	if input.Email == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Email and password are required",
		})
		return
	}

	if !validateEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Please enter a valid email address",
		})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var user models.User

	err := config.DB.Collection("users").FindOne(
		ctx,
		bson.M{
			"email": input.Email,
		},
	).Decode(&user)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid email or password",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to login",
		})
		return
	}

	if bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(input.Password),
	) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid email or password",
		})
		return
	}

	jwtSecret := strings.TrimSpace(os.Getenv("JWT_SECRET"))

	if jwtSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "JWT_SECRET is not configured",
		})
		return
	}

	now := time.Now()

	claims := jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"email":   user.Email,
		"role":    user.Role,
		"exp":     now.Add(24 * time.Hour).Unix(),
		"iat":     now.Unix(),
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	tokenString, err := token.SignedString(
		[]byte(jwtSecret),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create authentication token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"token":   tokenString,
		"user": gin.H{
			"id":              user.ID.Hex(),
			"name":            user.Name,
			"username":        user.Username,
			"email":           user.Email,
			"role":            user.Role,
			"profile_picture": user.ProfilePicture,
		},
	})
}

// ============================================================
// UPDATE PROFILE
// ============================================================

func UpdateProfile(c *gin.Context) {
	var request struct {
		Name           string `json:"name"`
		Username       string `json:"username"`
		ProfilePicture string `json:"profile_picture"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid profile request",
		})
		return
	}

	userID := c.GetString("user_id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	objectID, err := bson.ObjectIDFromHex(userID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
		})
		return
	}

	name := strings.TrimSpace(request.Name)
	username := strings.TrimSpace(request.Username)

	if name != "" && (len(name) < 2 || len(name) > 80) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Name must contain 2 to 80 characters",
		})
		return
	}

	if username != "" && (len(username) < 3 || len(username) > 30) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Username must contain 3 to 30 characters",
		})
		return
	}

	if username != "" {
		for _, character := range username {
			validCharacter :=
				(character >= 'a' && character <= 'z') ||
					(character >= 'A' && character <= 'Z') ||
					(character >= '0' && character <= '9') ||
					character == '_' ||
					character == '.'

			if !validCharacter {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"message": "Username contains invalid characters",
				})
				return
			}
		}
	}

	if request.ProfilePicture != "" {
		if !strings.HasPrefix(request.ProfilePicture, "data:image/") {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid profile picture",
			})
			return
		}

		if len(request.ProfilePicture) > 7*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Profile picture must be smaller than 7 MB",
			})
			return
		}
	}

	update := bson.M{}

	if name != "" {
		update["name"] = name
	}

	if username != "" {
		update["username"] = username
	}

	if request.ProfilePicture != "" {
		update["profile_picture"] = request.ProfilePicture
	}

	if len(update) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Nothing to update",
		})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	if username != "" {
		var existingUser models.User

		err = config.DB.Collection("users").FindOne(
			ctx,
			bson.M{
				"username": username,
				"_id": bson.M{
					"$ne": objectID,
				},
			},
		).Decode(&existingUser)

		if err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Username already exists",
			})
			return
		}

		if !errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Could not check username",
			})
			return
		}
	}

	_, err = config.DB.Collection("users").UpdateOne(
		ctx,
		bson.M{
			"_id": objectID,
		},
		bson.M{
			"$set": update,
		},
	)

	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Username already exists",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to update profile",
		})
		return
	}

	var user models.User

	err = config.DB.Collection("users").FindOne(
		ctx,
		bson.M{
			"_id": objectID,
		},
	).Decode(&user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to fetch updated profile",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
		"user": gin.H{
			"id":              user.ID.Hex(),
			"name":            user.Name,
			"username":        user.Username,
			"email":           user.Email,
			"role":            user.Role,
			"profile_picture": user.ProfilePicture,
		},
	})
}

// ============================================================
// CHANGE PASSWORD
// ============================================================

func ChangePassword(c *gin.Context) {
	var request struct {
		CurrentPassword string `json:"current_password" form:"current_password"`
		NewPassword     string `json:"new_password" form:"new_password"`
	}

	if err := c.ShouldBind(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid password request",
		})
		return
	}

	userID := c.GetString("user_id")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
		})
		return
	}

	objectID, err := bson.ObjectIDFromHex(userID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid user ID",
		})
		return
	}

	if request.CurrentPassword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Current password is required",
		})
		return
	}

	if len(request.NewPassword) < 6 || len(request.NewPassword) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "New password must contain 6 to 72 characters",
		})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var user models.User

	err = config.DB.Collection("users").FindOne(
		ctx,
		bson.M{
			"_id": objectID,
		},
	).Decode(&user)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Could not find user",
		})
		return
	}

	if bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(request.CurrentPassword),
	) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Current password is incorrect",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(request.NewPassword),
		bcrypt.DefaultCost,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to secure new password",
		})
		return
	}

	_, err = config.DB.Collection("users").UpdateOne(
		ctx,
		bson.M{
			"_id": objectID,
		},
		bson.M{
			"$set": bson.M{
				"password": string(hashedPassword),
			},
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to change password",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password changed successfully",
	})
}

// ============================================================
// CLEANUP
// ============================================================

func CleanupExpiredRegistrations() {
	if config.DB == nil {
		return
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	_, _ = config.DB.Collection("registration_otps").DeleteMany(
		ctx,
		bson.M{
			"expires_at": bson.M{
				"$lt": time.Now(),
			},
		},
	)
}
