package controllers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"

	"pulse-backend/config"
	"pulse-backend/models"
)

const (
	registrationOTPExpiry = 10 * time.Minute
	maxOTPAttempts        = 5
	otpLength             = 6
)

type RegistrationOTP struct {
	ID             bson.ObjectID `bson:"_id,omitempty"`
	Name           string        `bson:"name"`
	Username       string        `bson:"username"`
	Email          string        `bson:"email"`
	Password       string        `bson:"password"`
	OTPHash        string        `bson:"otp_hash"`
	CreatedAt      time.Time     `bson:"created_at"`
	ExpiresAt      time.Time     `bson:"expires_at"`
	Attempts       int           `bson:"attempts"`
	ProfilePicture string        `bson:"profile_picture"`
}

func generateOTP() (string, error) {
	buffer := make([]byte, 4)

	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}

	number := (uint32(buffer[0])<<24 |
		uint32(buffer[1])<<16 |
		uint32(buffer[2])<<8 |
		uint32(buffer[3])) % 1000000

	return fmt.Sprintf("%06d", number), nil
}

func hashOTP(otp string) string {
	hash := sha256.Sum256([]byte(otp))
	return hex.EncodeToString(hash[:])
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

func validateUsername(username string) bool {
	if len(username) < 3 || len(username) > 30 {
		return false
	}

	for _, character := range username {
		valid :=
			(character >= 'a' && character <= 'z') ||
				(character >= 'A' && character <= 'Z') ||
				(character >= '0' && character <= '9') ||
				character == '_' ||
				character == '.'

		if !valid {
			return false
		}
	}

	return true
}

func userResponse(user models.User) gin.H {
	return gin.H{
		"id":              user.ID.Hex(),
		"name":            user.Name,
		"username":        user.Username,
		"email":           user.Email,
		"role":            user.Role,
		"profile_picture": user.ProfilePicture,
	}
}

/*
=====================================================
REGISTER
=====================================================
POST /api/auth/register

This does NOT create the real user.

It:
1. Validates registration details.
2. Checks email/username.
3. Hashes password.
4. Generates OTP.
5. Stores temporary registration.
6. Returns OTP for the current demo flow.
*/
func Register(c *gin.Context) {
	var request struct {
		Name     string `json:"name" form:"name"`
		Username string `json:"username" form:"username"`
		Email    string `json:"email" form:"email"`
		Password string `json:"password" form:"password"`
	}

	if err := c.ShouldBind(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid registration request",
		})
		return
	}

	request.Name = strings.TrimSpace(request.Name)
	request.Username = strings.TrimSpace(request.Username)
	request.Email = strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	if request.Name == "" ||
		request.Username == "" ||
		request.Email == "" ||
		request.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "All registration fields are required",
		})
		return
	}

	if len(request.Name) < 2 || len(request.Name) > 80 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Name must contain 2 to 80 characters",
		})
		return
	}

	if !validateUsername(request.Username) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Username must contain 3 to 30 characters and only letters, numbers, _ or .",
		})
		return
	}

	if !validateEmail(request.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Please enter a valid email address",
		})
		return
	}

	if len(request.Password) < 6 || len(request.Password) > 72 {
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
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	usersCollection := config.DB.Collection("users")
	registrationCollection := config.DB.Collection("registration_otps")

	/*
		Check existing email.
	*/
	var existingUser models.User

	err := usersCollection.FindOne(
		ctx,
		bson.M{
			"email": request.Email,
		},
	).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Email already exists",
		})
		return
	}

	if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to check email",
		})
		return
	}

	/*
		Check existing username.
	*/
	err = usersCollection.FindOne(
		ctx,
		bson.M{
			"username": request.Username,
		},
	).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Username already exists",
		})
		return
	}

	if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to check username",
		})
		return
	}

	/*
		Hash password before storing temporary registration.
	*/
	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(request.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to secure password",
		})
		return
	}

	/*
		Generate OTP.
	*/
	otp, err := generateOTP()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to generate verification code",
		})
		return
	}

	now := time.Now()

	/*
		Remove previous registration for this email.
	*/
	_, err = registrationCollection.DeleteMany(
		ctx,
		bson.M{
			"email": request.Email,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to prepare registration",
		})
		return
	}

	/*
		Remove previous registration for this username.
	*/
	_, err = registrationCollection.DeleteMany(
		ctx,
		bson.M{
			"username": request.Username,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to prepare registration",
		})
		return
	}

	registration := RegistrationOTP{
		ID:             bson.NewObjectID(),
		Name:           request.Name,
		Username:       request.Username,
		Email:          request.Email,
		Password:       string(passwordHash),
		OTPHash:        hashOTP(otp),
		CreatedAt:      now,
		ExpiresAt:      now.Add(registrationOTPExpiry),
		Attempts:       0,
		ProfilePicture: "",
	}

	_, err = registrationCollection.InsertOne(
		ctx,
		registration,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to create registration",
		})
		return
	}

	/*
		Demo mode:
		Return OTP to frontend.

		Your current RegisterPage.jsx expects:
		response.data.otp
	*/
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Verification code generated",
		"otp":     otp,
	})
}

/*
=====================================================
VERIFY REGISTRATION OTP
=====================================================
POST /api/auth/verify-registration-otp

This creates the real user.
*/
func VerifyRegistrationOTP(c *gin.Context) {
	var request struct {
		Email string `json:"email" form:"email"`
		OTP   string `json:"otp" form:"otp"`
	}

	if err := c.ShouldBind(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid verification request",
		})
		return
	}

	request.Email = strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	request.OTP = strings.TrimSpace(request.OTP)

	if !validateEmail(request.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid email address",
		})
		return
	}

	if len(request.OTP) != otpLength {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Verification code must contain 6 digits",
		})
		return
	}

	for _, character := range request.OTP {
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
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	registrationCollection :=
		config.DB.Collection("registration_otps")

	var registration RegistrationOTP

	err := registrationCollection.FindOne(
		ctx,
		bson.M{
			"email": request.Email,
		},
	).Decode(&registration)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Registration not found or verification code expired",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to find registration",
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

	if registration.Attempts >= maxOTPAttempts {
		_, _ = registrationCollection.DeleteOne(
			ctx,
			bson.M{
				"_id": registration.ID,
			},
		)

		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": "Too many incorrect attempts. Please register again",
		})
		return
	}

	if hashOTP(request.OTP) != registration.OTPHash {
		_, _ = registrationCollection.UpdateOne(
			ctx,
			bson.M{
				"_id": registration.ID,
			},
			bson.M{
				"$inc": bson.M{
					"attempts": 1,
				},
			},
		)

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid verification code",
		})
		return
	}

	/*
		Check email again.
	*/
	usersCollection := config.DB.Collection("users")

	var existingUser models.User

	err = usersCollection.FindOne(
		ctx,
		bson.M{
			"email": registration.Email,
		},
	).Decode(&existingUser)

	if err == nil {
		_, _ = registrationCollection.DeleteOne(
			ctx,
			bson.M{
				"_id": registration.ID,
			},
		)

		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Email already exists",
		})
		return
	}

	if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to check email",
		})
		return
	}

	/*
		Check username again.
	*/
	err = usersCollection.FindOne(
		ctx,
		bson.M{
			"username": registration.Username,
		},
	).Decode(&existingUser)

	if err == nil {
		_, _ = registrationCollection.DeleteOne(
			ctx,
			bson.M{
				"_id": registration.ID,
			},
		)

		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Username already exists",
		})
		return
	}

	if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to check username",
		})
		return
	}

	/*
		Create actual user.
	*/
	user := models.User{
		ID:             bson.NewObjectID(),
		Name:           registration.Name,
		Username:       registration.Username,
		Email:          registration.Email,
		Password:       registration.Password,
		Role:           "creator",
		ProfilePicture: registration.ProfilePicture,
	}

	_, err = usersCollection.InsertOne(
		ctx,
		user,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to create account",
		})
		return
	}

	/*
		Delete temporary registration.
	*/
	_, _ = registrationCollection.DeleteOne(
		ctx,
		bson.M{
			"_id": registration.ID,
		},
	)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Account created successfully",
		"user":    userResponse(user),
	})
}

/*
=====================================================
LOGIN
=====================================================
POST /api/auth/login
*/
func Login(c *gin.Context) {
	var request struct {
		Email    string `json:"email" form:"email"`
		Password string `json:"password" form:"password"`
	}

	if err := c.ShouldBind(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid login request",
		})
		return
	}

	request.Email = strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	if !validateEmail(request.Email) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Please enter a valid email address",
		})
		return
	}

	if request.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Password is required",
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
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	var user models.User

	err := config.DB.
		Collection("users").
		FindOne(
			ctx,
			bson.M{
				"email": request.Email,
			},
		).
		Decode(&user)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid email or password",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(request.Password),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid email or password",
		})
		return
	}

	jwtSecret := strings.TrimSpace(
		os.Getenv("JWT_SECRET"),
	)

	if jwtSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "JWT_SECRET is not configured",
		})
		return
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"user_id": user.ID.Hex(),
			"email":   user.Email,
			"role":    user.Role,
			"exp": time.Now().
				Add(24 * time.Hour).
				Unix(),
		},
	)

	signedToken, err := token.SignedString(
		[]byte(jwtSecret),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to create login session",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"token":   signedToken,
		"user":    userResponse(user),
	})
}

/*
=====================================================
UPDATE PROFILE
=====================================================
PATCH /api/auth/profile
*/
func UpdateProfile(c *gin.Context) {
	var request struct {
		Name           string `json:"name"`
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

	update := bson.M{}

	if strings.TrimSpace(request.Name) != "" {
		update["name"] = strings.TrimSpace(request.Name)
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
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	_, err = config.DB.
		Collection("users").
		UpdateOne(
			ctx,
			bson.M{
				"_id": objectID,
			},
			bson.M{
				"$set": update,
			},
		)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to update profile",
		})
		return
	}

	var user models.User

	err = config.DB.
		Collection("users").
		FindOne(
			ctx,
			bson.M{
				"_id": objectID,
			},
		).
		Decode(&user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Unable to fetch updated profile",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    userResponse(user),
	})
}

/*
=====================================================
CHANGE PASSWORD
=====================================================
POST /api/auth/change-password
*/
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

	if request.CurrentPassword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Current password is required",
		})
		return
	}

	if len(request.NewPassword) < 6 ||
		len(request.NewPassword) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "New password must contain 6 to 72 characters",
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

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	var user models.User

	err = config.DB.
		Collection("users").
		FindOne(
			ctx,
			bson.M{
				"_id": objectID,
			},
		).
		Decode(&user)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "User not found",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(request.CurrentPassword),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Current password is incorrect",
		})
		return
	}

	newPasswordHash, err := bcrypt.GenerateFromPassword(
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

	_, err = config.DB.
		Collection("users").
		UpdateOne(
			ctx,
			bson.M{
				"_id": objectID,
			},
			bson.M{
				"$set": bson.M{
					"password": string(newPasswordHash),
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
