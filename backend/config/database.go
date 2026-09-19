package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func ConnectMongoDB() error {
	ctx, cancel := context.WithTimeout(
		context.Background(),
		15*time.Second,
	)
	defer cancel()

	mongoURI := os.Getenv("MONGO_URI")
	databaseName := os.Getenv("MONGO_DB_NAME")

	if mongoURI == "" {
		return fmt.Errorf("MONGO_URI is not set")
	}

	if databaseName == "" {
		return fmt.Errorf("MONGO_DB_NAME is not set")
	}

	clientOptions := options.Client().
		ApplyURI(mongoURI)

	client, err := mongo.Connect(clientOptions)
	if err != nil {
		return fmt.Errorf(
			"failed to connect to MongoDB: %w",
			err,
		)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf(
			"failed to ping MongoDB: %w",
			err,
		)
	}

	DB = client.Database(databaseName)

	// --------------------------------------------------
	// Votes collection
	// --------------------------------------------------

	votesCollection := DB.Collection("votes")

	// Remove duplicate votes before creating the
	// unique poll_id + user_id index.
	if err := removeDuplicateVotes(
		ctx,
		votesCollection,
	); err != nil {
		return fmt.Errorf(
			"failed to clean duplicate votes: %w",
			err,
		)
	}

	// --------------------------------------------------
	// Create unique vote index
	// --------------------------------------------------

	_, err = votesCollection.Indexes().CreateOne(
		ctx,
		mongo.IndexModel{
			Keys: bson.D{
				{Key: "poll_id", Value: 1},
				{Key: "user_id", Value: 1},
			},
			Options: options.Index().
				SetUnique(true),
		},
	)

	if err != nil {
		return fmt.Errorf(
			"failed to create votes unique index: %w",
			err,
		)
	}

	return nil
}

// removeDuplicateVotes keeps the oldest vote for each
// poll_id + user_id combination and removes the rest.
func removeDuplicateVotes(
	ctx context.Context,
	collection *mongo.Collection,
) error {

	pipeline := mongo.Pipeline{
		{
			{
				Key: "$sort",
				Value: bson.D{
					{Key: "voted_at", Value: 1},
				},
			},
		},
		{
			{
				Key: "$group",
				Value: bson.D{
					{
						Key: "_id",
						Value: bson.D{
							{Key: "poll_id", Value: "$poll_id"},
							{Key: "user_id", Value: "$user_id"},
						},
					},
					{
						Key: "ids",
						Value: bson.D{
							{
								Key:   "$push",
								Value: "$_id",
							},
						},
					},
					{
						Key: "count",
						Value: bson.D{
							{Key: "$sum", Value: 1},
						},
					},
				},
			},
		},
		{
			{
				Key: "$match",
				Value: bson.D{
					{
						Key: "count",
						Value: bson.D{
							{Key: "$gt", Value: 1},
						},
					},
				},
			},
		},
	}

	cursor, err := collection.Aggregate(
		ctx,
		pipeline,
	)
	if err != nil {
		return err
	}

	defer cursor.Close(ctx)

	type duplicateGroup struct {
		ID struct {
			PollID string `bson:"poll_id"`
			UserID string `bson:"user_id"`
		} `bson:"_id"`

		IDs   []bson.ObjectID `bson:"ids"`
		Count int             `bson:"count"`
	}

	var groups []duplicateGroup

	if err := cursor.All(ctx, &groups); err != nil {
		return err
	}

	for _, group := range groups {
		if len(group.IDs) <= 1 {
			continue
		}

		// Keep the first/oldest vote.
		duplicateIDs := group.IDs[1:]

		_, err := collection.DeleteMany(
			ctx,
			bson.M{
				"_id": bson.M{
					"$in": duplicateIDs,
				},
			},
		)

		if err != nil {
			return fmt.Errorf(
				"failed deleting duplicate votes for poll %s user %s: %w",
				group.ID.PollID,
				group.ID.UserID,
				err,
			)
		}
	}

	return nil
}
