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

		authHeader := strings.TrimSpace(
			c.GetHeader("Authorization"),
		)

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Authorization token is required",
			})
			c.Abort()
			return
		}

		parts := strings.Fields(authHeader)

		if len(parts) != 2 ||
			!strings.EqualFold(parts[0], "Bearer") {

			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid authorization format",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimSpace(parts[1])

		jwtSecret := strings.TrimSpace(
			os.Getenv("JWT_SECRET"),
		)

		if jwtSecret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "JWT_SECRET is not configured",
			})
			c.Abort()
			return
		}

		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {

				if token.Method != jwt.SigningMethodHS256 {
					return nil, jwt.ErrTokenSignatureInvalid
				}

				return []byte(jwtSecret), nil
			},
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid token claims",
			})
			c.Abort()
			return
		}

		// Support user_id
		userID, _ := claims["user_id"].(string)

		// Also support id for compatibility
		if strings.TrimSpace(userID) == "" {
			userID, _ = claims["id"].(string)
		}

		if strings.TrimSpace(userID) == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "User ID not found in token",
			})
			c.Abort()
			return
		}

		email, _ := claims["email"].(string)

		c.Set("user_id", userID)
		c.Set("email", email)

		c.Next()
	}
}
