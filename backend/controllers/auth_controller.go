package controllers




import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
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
	"github.com/resend/resend-go/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"golang.org/x/crypto/bcrypt"

	"pulse-backend/config"
	"pulse-backend/models"
)




func generateOTP() (string, error) {
	bytes := make([]byte, 4)

	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	number :=
		uint32(bytes[0])<<24 |
			uint32(bytes[1])<<16 |
			uint32(bytes[2])<<8 |
			uint32(bytes[3])

	return fmt.Sprintf("%06d", number%1000000), nil
}

func hashOTP(otp string) string {
	hash := sha256.Sum256([]byte(otp))
	return hex.EncodeToString(hash[:])
}

func validateEmail(email string) bool {
	email = strings.TrimSpace(email)

	_, err := mail.ParseAddress(email)

	return err == nil
}

func getRequestEmail(c *gin.Context) string {
	var body struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		return ""
	}

	return strings.ToLower(
		strings.TrimSpace(body.Email),
	)
}

func sendOTPEmail(email string, otp string) error {
	apiKey := strings.TrimSpace(
		os.Getenv("RESEND_API_KEY"),
	)

	if apiKey == "" {
		return fmt.Errorf(
			"RESEND_API_KEY is not configured",
		)
	}

	from := strings.TrimSpace(
		os.Getenv("RESEND_FROM_EMAIL"),
	)

	if from == "" {
		from = "PULSE <onboarding@resend.dev>"
	}

	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{email},
		Subject: "Your PULSE verification code",
		Html: fmt.Sprintf(`
			<div style="font-family:Arial,sans-serif">
				<h2>PULSE Email Verification</h2>
				<p>Your verification code is:</p>
				<h1>%s</h1>
				<p>This code expires in 10 minutes.</p>
			</div>
		`, otp),
	}

	_, err := client.Emails.Send(params)

	return err
}

func ensureOTPIndexes() {
	collection := config.DB.Collection("email_otps")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	_, err := collection.Indexes().CreateOne(
		ctx,
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "email", Value: 1},
			},
		},
	)

	if err != nil {
		fmt.Println("OTP INDEX ERROR:", err)
	}
}

func ensureUserIndexes() {
	collection := config.DB.Collection("users")

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	_, err := collection.Indexes().CreateOne(
		ctx,
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "email", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
	)

	if err != nil {
		fmt.Println("USER EMAIL INDEX ERROR:", err)
	}
}

func SendRegistrationOTP(c *gin.Context) {
	email := getRequestEmail(c)

	if email == "" || !validateEmail(email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Valid email is required",
		})
		return
	}

	users := config.DB.Collection("users")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var existingUser models.User

	err := users.FindOne(
		ctx,
		bson.M{
			"email": email,
		},
	).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"message": "Email is already registered",
		})
		return
	}

	if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not verify email",
		})
		return
	}

	otp, err := generateOTP()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not generate OTP",
		})
		return
	}

	otpCollection := config.DB.Collection("email_otps")

	_, _ = otpCollection.DeleteMany(
		ctx,
		bson.M{
			"email": email,
		},
	)

	record := bson.M{
		"email":      email,
		"otp_hash":   hashOTP(otp),
		"expires_at": time.Now().Add(10 * time.Minute),
		"created_at": time.Now(),
	}

	_, err = otpCollection.InsertOne(
		ctx,
		record,
	)

	if err != nil {
		fmt.Println("SAVE OTP ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not save OTP",
		})
		return
	}

	if err := sendOTPEmail(email, otp); err != nil {
		fmt.Println("SEND OTP EMAIL ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not send verification email",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP sent successfully",
	})
}

func VerifyRegistrationOTP(c *gin.Context) {
	var body struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	email := strings.ToLower(
		strings.TrimSpace(body.Email),
	)

	otp := strings.TrimSpace(body.OTP)

	if email == "" || otp == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email and OTP are required",
		})
		return
	}

	collection := config.DB.Collection("email_otps")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var record struct {
		Email     string    `bson:"email"`
		OTPHash   string    `bson:"otp_hash"`
		ExpiresAt time.Time `bson:"expires_at"`
	}

	err := collection.FindOne(
		ctx,
		bson.M{
			"email": email,
		},
		options.FindOne().SetSort(
			bson.D{
				{Key: "created_at", Value: -1},
			},
		),
	).Decode(&record)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "OTP not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not verify OTP",
		})
		return
	}

	if time.Now().After(record.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "OTP has expired",
		})
		return
	}

	if record.OTPHash != hashOTP(otp) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid OTP",
		})
		return
	}

	_, _ = collection.DeleteMany(
		ctx,
		bson.M{
			"email": email,
		},
	)

	c.JSON(http.StatusOK, gin.H{
		"message":  "Email verified successfully",
		"verified": true,
	})
}

func Register(c *gin.Context) {
	var body struct {
		Name     string `json:"name"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	name := strings.TrimSpace(body.Name)
	username := strings.TrimSpace(body.Username)
	email := strings.ToLower(
		strings.TrimSpace(body.Email),
	)
	password := body.Password

	if name == "" ||
		email == "" ||
		password == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Name, email and password are required",
		})
		return
	}

	if !validateEmail(email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid email address",
		})
		return
	}

	if len(password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Password must contain at least 6 characters",
		})
		return
	}

	users := config.DB.Collection("users")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var existing models.User

	err := users.FindOne(
		ctx,
		bson.M{
			"email": email,
		},
	).Decode(&existing)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"message": "Email is already registered",
		})
		return
	}

	if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not verify account",
		})
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not secure password",
		})
		return
	}

	user := models.User{
		ID:       bson.NewObjectID(),
		Name:     name,
		Username: username,
		Email:    email,
		Password: string(passwordHash),
		Role:     "creator",
	}

	_, err = users.InsertOne(
		ctx,
		user,
	)

	if err != nil {
		fmt.Println("REGISTER ERROR:", err)

		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusConflict, gin.H{
				"message": "Email is already registered",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not create account",
		})
		return
	}

	user.Password = ""

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully",
		"user":    user,
	})
}

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	input.Email = strings.TrimSpace(
		strings.ToLower(input.Email),
	)

	if input.Email == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email and password are required",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var user models.User

	err := config.DB.
		Collection("users").
		FindOne(
			ctx,
			bson.M{
				"email": input.Email,
			},
		).
		Decode(&user)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid email or password",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to login",
			"error":   err.Error(),
		})
		return
	}

	if user.Password == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid email or password",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(input.Password),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid email or password",
		})
		return
	}

	jwtSecret := strings.TrimSpace(
		os.Getenv("JWT_SECRET"),
	)

	if jwtSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "JWT_SECRET is not configured",
		})
		return
	}

	claims := jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
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
			"message": "Failed to create authentication token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
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

func UpdateProfile(c *gin.Context) {
	userID := strings.TrimSpace(c.GetString("user_id"))

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	objectID, err := bson.ObjectIDFromHex(userID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid user ID",
		})
		return
	}

	var body struct {
		Name           string `json:"name"`
		Username       string `json:"username"`
		ProfilePicture string `json:"profile_picture"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid profile data",
		})
		return
	}

	name := strings.TrimSpace(body.Name)
	username := strings.TrimSpace(body.Username)
	profilePicture := strings.TrimSpace(body.ProfilePicture)

	if name == "" && username == "" && profilePicture == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "No profile changes provided",
		})
		return
	}

	collection := config.DB.Collection("users")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	/*
		USERNAME
	*/

	if username != "" {
		if len(username) < 3 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Username must contain at least 3 characters",
			})
			return
		}

		if len(username) > 30 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Username cannot exceed 30 characters",
			})
			return
		}

		username = strings.ToLower(username)

		var existingUser models.User

		err := collection.FindOne(
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
				"message": "Username is already taken",
			})
			return
		}

		if !errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed to check username",
			})
			return
		}
	}

	/*
		PROFILE IMAGE
	*/

	if profilePicture != "" {

		if !strings.HasPrefix(
			profilePicture,
			"data:image/",
		) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Invalid profile image format",
			})
			return
		}

		// Protect MongoDB from extremely large images.
		if len(profilePicture) > 7*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Profile image is too large. Please choose a smaller image.",
			})
			return
		}
	}

	/*
		BUILD UPDATE
	*/

	update := bson.M{}

	if name != "" {
		update["name"] = name
	}

	if username != "" {
		update["username"] = username
	}

	if profilePicture != "" {
		update["profile_picture"] = profilePicture
	}

	/*
		UPDATE USER
	*/

	result, err := collection.UpdateOne(
		ctx,
		bson.M{
			"_id": objectID,
		},
		bson.M{
			"$set": update,
		},
	)

	if err != nil {
		fmt.Println("UPDATE PROFILE ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not update profile",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "User not found",
		})
		return
	}

	/*
		GET UPDATED USER
	*/

	var updatedUser models.User

	err = collection.FindOne(
		ctx,
		bson.M{
			"_id": objectID,
		},
	).Decode(&updatedUser)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load updated profile",
		})
		return
	}

	updatedUser.Password = ""

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user": gin.H{
			"id":              updatedUser.ID.Hex(),
			"name":            updatedUser.Name,
			"username":        updatedUser.Username,
			"email":           updatedUser.Email,
			"role":            updatedUser.Role,
			"profile_picture": updatedUser.ProfilePicture,
		},
	})
}

func ChangePassword(c *gin.Context) {
	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	var body struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	if len(body.NewPassword) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "New password must contain at least 6 characters",
		})
		return
	}

	objectID, err := bson.ObjectIDFromHex(userID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid user ID",
		})
		return
	}

	collection := config.DB.Collection("users")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var user models.User

	err = collection.FindOne(
		ctx,
		bson.M{
			"_id": objectID,
		},
	).Decode(&user)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "User not found",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(body.CurrentPassword),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Current password is incorrect",
		})
		return
	}

	newHash, err := bcrypt.GenerateFromPassword(
		[]byte(body.NewPassword),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not secure new password",
		})
		return
	}

	_, err = collection.UpdateOne(
		ctx,
		bson.M{
			"_id": objectID,
		},
		bson.M{
			"$set": bson.M{
				"password":   string(newHash),
				"updated_at": time.Now(),
			},
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not change password",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password changed successfully",
	})
}

// Keep these functions available if your existing application
// calls them during startup.

func InitializeAuthIndexes() {
	ensureOTPIndexes()
	ensureUserIndexes()
}

// Prevent accidental unused helper issues if these are used
// from another controller in your existing project.
func _authFilePath() string {
	return filepath.Join(
		".",
		"uploads",
		"profiles",
	)
}
