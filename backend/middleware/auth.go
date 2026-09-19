package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization header is required",
			})

			c.Abort()
			return
		}

		parts := strings.SplitN(
			authHeader,
			" ",
			2,
		)

		if len(parts) != 2 ||
			!strings.EqualFold(parts[0], "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid authorization header",
			})

			c.Abort()
			return
		}

		tokenString := strings.TrimSpace(parts[1])

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Token is missing",
			})

			c.Abort()
			return
		}

		jwtSecret := os.Getenv("JWT_SECRET")

		if jwtSecret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "JWT_SECRET is missing",
			})

			c.Abort()
			return
		}

		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {
				if token.Method != jwt.SigningMethodHS256 {
					return nil, jwt.ErrSignatureInvalid
				}

				return []byte(jwtSecret), nil
			},
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or expired token",
			})

			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid token claims",
			})

			c.Abort()
			return
		}

		userID, ok := claims["user_id"].(string)

		if !ok || userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid user ID in token",
			})

			c.Abort()
			return
		}

		c.Set(
			"user_id",
			userID,
		)

		if email, ok := claims["email"].(string); ok {
			c.Set(
				"user_email",
				email,
			)
		}

		if role, ok := claims["role"].(string); ok {
			c.Set(
				"user_role",
				role,
			)
		}

		c.Next()
	}
}
