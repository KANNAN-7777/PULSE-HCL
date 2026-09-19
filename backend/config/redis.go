package config

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func ConnectRedis() {
	redisURL := os.Getenv("REDIS_URL")

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		panic(err)
	}

	RedisClient = redis.NewClient(opt)

	ctx := context.Background()

	_, err = RedisClient.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}

	fmt.Println("Redis connected successfully")
}
