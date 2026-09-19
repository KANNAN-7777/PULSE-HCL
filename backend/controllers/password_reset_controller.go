package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"

	"pulse-backend/config"
)

func SendPasswordResetOTP(c *gin.Context) {
	var request struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(request.Email))

	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email is required",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userCollection := config.DB.Collection("users")

	var user bson.M

	err := userCollection.FindOne(
		ctx,
		bson.M{"email": email},
	).Decode(&user)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "No account found with this email",
		})
		return
	}

	otp, err := generateOTP()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to generate OTP",
		})
		return
	}

	hashedOTP, err := bcrypt.GenerateFromPassword(
		[]byte(otp),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to secure OTP",
		})
		return
	}

	otpCollection := config.DB.Collection("password_otps")

	_, err = otpCollection.DeleteMany(
		ctx,
		bson.M{"email": email},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to reset previous OTP",
		})
		return
	}

	now := time.Now()

	otpData := bson.M{
		"email":      email,
		"otp":        string(hashedOTP),
		"expires_at": now.Add(5 * time.Minute),
		"verified":   false,
		"created_at": now,
	}

	_, err = otpCollection.InsertOne(ctx, otpData)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create password reset request",
		})
		return
	}

	err = sendOTPEmail(email, otp)

	if err != nil {
		_, _ = otpCollection.DeleteMany(
			ctx,
			bson.M{"email": email},
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to send OTP email",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset OTP sent successfully",
	})
}

func VerifyPasswordResetOTP(c *gin.Context) {
	var request struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(request.Email))
	otp := strings.TrimSpace(request.OTP)

	if email == "" || otp == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email and OTP are required",
		})
		return
	}

	if len(otp) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "OTP must contain 6 digits",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	otpCollection := config.DB.Collection("password_otps")

	var otpData bson.M

	err := otpCollection.FindOne(
		ctx,
		bson.M{"email": email},
	).Decode(&otpData)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "OTP not found. Please request a new OTP",
		})
		return
	}

	expiresAt, ok := otpData["expires_at"].(time.Time)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Invalid OTP data",
		})
		return
	}

	if time.Now().After(expiresAt) {
		_, _ = otpCollection.DeleteMany(
			ctx,
			bson.M{"email": email},
		)

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "OTP has expired. Please request a new OTP",
		})
		return
	}

	hashedOTP, ok := otpData["otp"].(string)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Invalid OTP data",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(hashedOTP),
		[]byte(otp),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid OTP",
		})
		return
	}

	_, err = otpCollection.UpdateOne(
		ctx,
		bson.M{"email": email},
		bson.M{
			"$set": bson.M{
				"verified": true,
			},
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to verify OTP",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP verified successfully",
	})
}

func ResetPassword(c *gin.Context) {
	var request struct {
		Email       string `json:"email"`
		OTP         string `json:"otp"`
		NewPassword string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(request.Email))
	otp := strings.TrimSpace(request.OTP)

	if email == "" || otp == "" || request.NewPassword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email, OTP and new password are required",
		})
		return
	}

	if len(otp) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "OTP must contain 6 digits",
		})
		return
	}

	if len(request.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Password must be at least 8 characters",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	otpCollection := config.DB.Collection("password_otps")

	var otpData bson.M

	err := otpCollection.FindOne(
		ctx,
		bson.M{
			"email":    email,
			"verified": true,
		},
	).Decode(&otpData)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "OTP verification required",
		})
		return
	}

	expiresAt, ok := otpData["expires_at"].(time.Time)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Invalid OTP data",
		})
		return
	}

	if time.Now().After(expiresAt) {
		_, _ = otpCollection.DeleteMany(
			ctx,
			bson.M{"email": email},
		)

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "OTP has expired",
		})
		return
	}

	userCollection := config.DB.Collection("users")

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(request.NewPassword),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Password hashing failed",
		})
		return
	}

	result, err := userCollection.UpdateOne(
		ctx,
		bson.M{"email": email},
		bson.M{
			"$set": bson.M{
				"password": string(hashedPassword),
			},
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update password",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "User not found",
		})
		return
	}

	_, _ = otpCollection.DeleteMany(
		ctx,
		bson.M{"email": email},
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully",
	})
}
