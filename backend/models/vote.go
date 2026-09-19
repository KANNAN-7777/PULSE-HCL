package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Vote struct {
	ID       bson.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID   string        `bson:"poll_id" json:"poll_id"`
	UserID   string        `bson:"user_id" json:"user_id"`
	OptionID string        `bson:"option_id,omitempty" json:"option_id,omitempty"`
	Answer   string        `bson:"answer,omitempty" json:"answer,omitempty"`
	VotedAt  time.Time     `bson:"voted_at" json:"voted_at"`
}
