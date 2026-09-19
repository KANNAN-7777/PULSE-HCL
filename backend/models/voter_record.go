package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type VoterRecord struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID    bson.ObjectID `bson:"poll_id" json:"poll_id"`
	VoterID   bson.ObjectID `bson:"voter_id" json:"voter_id"`
	OptionID  string        `bson:"option_id" json:"option_id"`
	Answer    string        `bson:"answer,omitempty" json:"answer,omitempty"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
}
