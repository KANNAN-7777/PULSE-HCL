package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"pulse-backend/config"
	"pulse-backend/routes"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if origin == "http://localhost:5174" ||
			origin == "http://localhost:5173" {
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
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(
				http.StatusNoContent,
			)
			return
		}

		c.Next()
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found")
	}

	if err := config.ConnectMongoDB(); err != nil {
		log.Fatal(err)
	}

	router := gin.Default()

	router.Use(corsMiddleware())

	router.Static(
		"/uploads",
		"./uploads",
	)

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "PULSE backend is running",
		})
	})

	routes.AuthRoutes(router)
	routes.PollRoutes(router)

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Println(
		"PULSE backend running on port",
		port,
	)

	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
