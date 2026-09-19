package websocket

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	gorilla "github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pulse-backend/config"
)

var upgrader = gorilla.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")

		return origin == "http://localhost:5173" ||
			origin == "http://localhost:5174" ||
			origin == "http://localhost:5175" ||
			origin == "http://localhost:3000" ||
			origin == "https://pulse-hcl.vercel.app"
	},
}

func authenticateWebSocket(c *gin.Context) bool {
	tokenString := strings.TrimSpace(
		c.Query("token"),
	)

	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "WebSocket token is required",
		})
		return false
	}

	jwtSecret := strings.TrimSpace(
		os.Getenv("JWT_SECRET"),
	)

	if jwtSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "JWT_SECRET is not configured",
		})
		return false
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
			"message": "Invalid or expired WebSocket token",
		})
		return false
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid WebSocket token claims",
		})
		return false
	}

	userID, ok := claims["user_id"].(string)

	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid user ID",
		})
		return false
	}

	c.Set("user_id", userID)

	return true
}

func HandlePollWebSocket(c *gin.Context) {
	if !authenticateWebSocket(c) {
		return
	}

	pollID := strings.TrimSpace(
		c.Param("id"),
	)

	if pollID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Poll ID is required",
		})
		return
	}

	if _, err := bson.ObjectIDFromHex(pollID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid poll ID",
		})
		return
	}

	if config.RedisClient == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Redis is not connected",
		})
		return
	}

	conn, err := upgrader.Upgrade(
		c.Writer,
		c.Request,
		nil,
	)

	if err != nil {
		return
	}

	defer conn.Close()

	ctx, cancel := context.WithCancel(
		context.Background(),
	)

	defer cancel()

	channel := "poll:" + pollID

	pubsub := config.RedisClient.Subscribe(
		ctx,
		channel,
	)

	defer pubsub.Close()

	if _, err := pubsub.Receive(
		ctx,
	); err != nil {
		return
	}

	for {
		message, err := pubsub.ReceiveMessage(ctx)

		if err != nil {
			return
		}

		if err := conn.WriteMessage(
			gorilla.TextMessage,
			[]byte(message.Payload),
		); err != nil {
			return
		}
	}
}
