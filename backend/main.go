package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"pulse-backend/config"
	"pulse-backend/routes"
	pollws "pulse-backend/websocket"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		allowedOrigins := map[string]bool{
			"http://localhost:5173":        true,
			"http://localhost:5174":        true,
			"http://localhost:5175":        true,
			"http://localhost:3000":        true,
			"https://pulse-hcl.vercel.app": true,
		}

		if allowedOrigins[origin] {
			c.Header(
				"Access-Control-Allow-Origin",
				origin,
			)

			c.Header(
				"Access-Control-Allow-Credentials",
				"true",
			)

			c.Header(
				"Access-Control-Allow-Headers",
				"Origin, Content-Type, Accept, Authorization",
			)

			c.Header(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, PATCH, DELETE, OPTIONS",
			)

			c.Header(
				"Access-Control-Max-Age",
				"86400",
			)
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found")
	}

	// Connect MongoDB
	if err := config.ConnectDatabase(); err != nil {
		log.Fatal(
			"MongoDB connection failed:",
			err,
		)
	}

	// Connect Redis
	config.ConnectRedis()

	// Create Gin router
	router := gin.Default()

	// CORS
	router.Use(corsMiddleware())

	// Serve uploaded files
	router.Static(
		"/uploads",
		"./uploads",
	)

	// Authentication routes
	routes.AuthRoutes(router)

	// Poll routes
	routes.PollRoutes(router)

	// WebSocket route
	router.GET(
		"/ws/polls/:id",
		pollws.HandlePollWebSocket,
	)

	log.Println(
		"PULSE backend running on http://localhost:8080",
	)

	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}