package routes

import (
	"github.com/gin-gonic/gin"

	"pulse-backend/controllers"
	"pulse-backend/middleware"
)

func AuthRoutes(router *gin.Engine) {
	auth := router.Group("/api/auth")

	/*
		====================================================
		PUBLIC AUTH ROUTES
		====================================================
	*/

	// Register:
	// Generates a random OTP and stores temporary
	// registration data in MongoDB.
	auth.POST(
		"/register",
		controllers.Register,
	)

	// Verify the random OTP:
	// Creates the real user in MongoDB.
	auth.POST(
		"/verify-registration-otp",
		controllers.VerifyRegistrationOTP,
	)

	// Login
	auth.POST(
		"/login",
		controllers.Login,
	)

	/*
		====================================================
		PROTECTED AUTH ROUTES
		====================================================
	*/

	protected := auth.Group("")
	protected.Use(
		middleware.AuthMiddleware(),
	)

	protected.PATCH(
		"/profile",
		controllers.UpdateProfile,
	)

	protected.POST(
		"/change-password",
		controllers.ChangePassword,
	)
}
