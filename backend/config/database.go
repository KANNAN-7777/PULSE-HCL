
package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func ConnectDatabase() error {
	mongoURI := os.Getenv("MONGO_URI")

	if mongoURI == "" {
		return fmt.Errorf("MONGO_URI is not configured")
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	client, err := mongo.Connect(
		options.Client().ApplyURI(mongoURI),
	)

	if err != nil {
		return fmt.Errorf(
			"failed to create MongoDB client: %w",
			err,
		)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf(
			"failed to ping MongoDB: %w",
			err,
		)
	}

	DB = client.Database("pulse")

	fmt.Println("MongoDB connected successfully")

	return nil
}
