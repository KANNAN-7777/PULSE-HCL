package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pulse-backend/config"
)

func SendOTP(c *gin.Context) {
	c.JSON(http.StatusGone, gin.H{
		"success": false,
		"message": "This OTP endpoint is no longer used. Use /api/auth/register/send-otp.",
	})
}

func VerifyOTP(c *gin.Context) {
	c.JSON(http.StatusGone, gin.H{
		"success": false,
		"message": "This OTP endpoint is no longer used. Use /api/auth/register/verify-otp.",
	})
}

func GetOTPStatus(c *gin.Context) {
	email := c.Query("email")

	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Email is required",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	var result struct {
		Verified bool `bson:"verified"`
	}

	err := config.DB.
		Collection("otp_registrations").
		FindOne(
			ctx,
			bson.M{"email": email},
		).
		Decode(&result)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success":  true,
			"verified": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"verified": result.Verified,
	})
}
