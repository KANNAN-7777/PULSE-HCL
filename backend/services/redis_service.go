package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"pulse-backend/config"
)

type LivePollUpdate struct {
	PollID   string `json:"poll_id"`
	OptionID string `json:"option_id"`
	Votes    int64  `json:"votes"`
}

func IncrementVote(pollID string, optionID string) (int64, error) {
	// -----------------------------
	// INPUT VALIDATION
	// -----------------------------

	pollID = strings.TrimSpace(pollID)
	optionID = strings.TrimSpace(optionID)

	if pollID == "" {
		return 0, fmt.Errorf("poll ID is required")
	}

	if optionID == "" {
		return 0, fmt.Errorf("option ID is required")
	}

	// Prevent unexpectedly large Redis keys.
	if len(pollID) > 100 {
		return 0, fmt.Errorf("poll ID is too long")
	}

	if len(optionID) > 100 {
		return 0, fmt.Errorf("option ID is too long")
	}

	// Redis must be initialized before any operation.
	if config.RedisClient == nil {
		return 0, fmt.Errorf("redis client is not initialized")
	}

	ctx := context.Background()

	// -----------------------------
	// INCREMENT VOTE COUNT
	// -----------------------------

	key := fmt.Sprintf(
		"poll:%s:votes:%s",
		pollID,
		optionID,
	)

	votes, err := config.RedisClient.
		Incr(ctx, key).
		Result()

	if err != nil {
		return 0, fmt.Errorf(
			"redis increment failed: %w",
			err,
		)
	}

	// -----------------------------
	// CREATE REALTIME UPDATE
	// -----------------------------

	update := LivePollUpdate{
		PollID:   pollID,
		OptionID: optionID,
		Votes:    votes,
	}

	data, err := json.Marshal(update)

	if err != nil {
		return 0, fmt.Errorf(
			"failed to encode live poll update: %w",
			err,
		)
	}

	// -----------------------------
	// PUBLISH REALTIME UPDATE
	// -----------------------------

	channel := fmt.Sprintf(
		"poll:%s",
		pollID,
	)

	err = config.RedisClient.
		Publish(ctx, channel, data).
		Err()

	if err != nil {
		return 0, fmt.Errorf(
			"redis publish failed: %w",
			err,
		)
	}

	return votes, nil
}
