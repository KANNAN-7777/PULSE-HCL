package controllers

import (
	"context"
	"crypto/rand"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/resend/resend-go/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"

	"pulse-backend/config"
)

func generatePasswordResetOTP() (string, error) {
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

func sendPasswordResetOTPEmail(
	email string,
	otp string,
) error {
	apiKey := strings.TrimSpace(
		os.Getenv("RESEND_API_KEY"),
	)

	from := strings.TrimSpace(
		os.Getenv("RESEND_FROM"),
	)

	if apiKey == "" {
		return fmt.Errorf(
			"RESEND_API_KEY is missing",
		)
	}

	if from == "" {
		return fmt.Errorf(
			"RESEND_FROM is missing",
		)
	}

	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From: from,
		To: []string{
			email,
		},
		Subject: "PULSE Password Reset Code",
		Html: fmt.Sprintf(`
			<!DOCTYPE html>
			<html>
			<body style="
				margin:0;
				padding:0;
				background:#f4f4f4;
				font-family:Arial,sans-serif;
			">
				<div style="
					max-width:500px;
					margin:40px auto;
					background:#ffffff;
					padding:32px;
					border-radius:16px;
				">

					<h2 style="
						margin:0 0 20px;
						color:#111111;
					">
						PULSE
					</h2>

					<p style="color:#555555;">
						Use the verification code below
						to reset your password.
					</p>

					<div style="
						margin:25px 0;
						padding:20px;
						background:#111111;
						border-radius:12px;
						text-align:center;
					">
						<span style="
							font-size:32px;
							font-weight:bold;
							letter-spacing:8px;
							color:#FFD21F;
						">
							%s
						</span>
					</div>

					<p style="
						color:#777777;
						font-size:14px;
					">
						This code expires in 5 minutes.
					</p>

					<p style="
						color:#777777;
						font-size:14px;
					">
						If you did not request a password reset,
						you can safely ignore this email.
					</p>

				</div>
			</body>
			</html>
		`, otp),
	}

	_, err := client.Emails.Send(params)

	if err != nil {
		return fmt.Errorf(
			"password reset email delivery failed: %w",
			err,
		)
	}

	return nil
}

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

	email := strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email is required",
		})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	userCollection := config.DB.Collection("users")

	var user bson.M

	err := userCollection.FindOne(
		ctx,
		bson.M{
			"email": email,
		},
	).Decode(&user)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "No account found with this email",
		})
		return
	}

	otp, err := generatePasswordResetOTP()

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

	otpCollection := config.DB.Collection(
		"password_otps",
	)

	_, err = otpCollection.DeleteMany(
		ctx,
		bson.M{
			"email": email,
		},
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

	_, err = otpCollection.InsertOne(
		ctx,
		otpData,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create password reset request",
		})
		return
	}

	err = sendPasswordResetOTPEmail(
		email,
		otp,
	)

	if err != nil {
		_, _ = otpCollection.DeleteMany(
			ctx,
			bson.M{
				"email": email,
			},
		)

		fmt.Println(
			"PASSWORD RESET EMAIL ERROR:",
			err,
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to send OTP email",
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

	email := strings.ToLower(
		strings.TrimSpace(request.Email),
	)

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

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	otpCollection := config.DB.Collection(
		"password_otps",
	)

	var otpData bson.M

	err := otpCollection.FindOne(
		ctx,
		bson.M{
			"email": email,
		},
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
			bson.M{
				"email": email,
			},
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
		bson.M{
			"email": email,
		},
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

	email := strings.ToLower(
		strings.TrimSpace(request.Email),
	)

	otp := strings.TrimSpace(request.OTP)

	if email == "" ||
		otp == "" ||
		request.NewPassword == "" {
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

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	otpCollection := config.DB.Collection(
		"password_otps",
	)

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
			bson.M{
				"email": email,
			},
		)

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "OTP has expired",
		})
		return
	}

	userCollection := config.DB.Collection(
		"users",
	)

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
		bson.M{
			"email": email,
		},
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
		bson.M{
			"email": email,
		},
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully",
	})
}
