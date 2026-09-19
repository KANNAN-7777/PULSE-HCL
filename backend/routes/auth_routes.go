package routes

import (
	"github.com/gin-gonic/gin"

	"pulse-backend/controllers"
	"pulse-backend/middleware"
)

func AuthRoutes(router *gin.Engine) {
	auth := router.Group("/api/auth")

	// Public routes
	auth.POST("/send-registration-otp", controllers.SendRegistrationOTP)
	auth.POST("/verify-registration-otp", controllers.VerifyRegistrationOTP)
	auth.POST("/register", controllers.Register)
	auth.POST("/login", controllers.Login)

	// Protected routes
	protected := auth.Group("")
	protected.Use(middleware.AuthMiddleware())

	protected.PATCH("/profile", controllers.UpdateProfile)
	protected.POST("/change-password", controllers.ChangePassword)
}
