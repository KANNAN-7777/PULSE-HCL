package websocket

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	gorilla "github.com/gorilla/websocket"

	"pulse-backend/config"
)

var upgrader = gorilla.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandlePollWebSocket(c *gin.Context) {
	pollID := c.Param("id")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	defer conn.Close()

	ctx := context.Background()

	channel := "poll:" + pollID

	pubsub := config.RedisClient.Subscribe(ctx, channel)
	defer pubsub.Close()

	for {
		message, err := pubsub.ReceiveMessage(ctx)

		if err != nil {
			break
		}

		err = conn.WriteMessage(
			gorilla.TextMessage,
			[]byte(message.Payload),
		)

		if err != nil {
			break
		}
	}
}
