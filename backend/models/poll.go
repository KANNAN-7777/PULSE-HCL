package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type PollOption struct {
	ID    string `bson:"id" json:"id"`
	Text  string `bson:"text" json:"text"`
	Votes int    `bson:"votes" json:"votes"`
	Image string `bson:"image,omitempty" json:"image,omitempty"`
}

type Poll struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Question     string        `bson:"question" json:"question"`
	Type         string        `bson:"type" json:"type"`
	Category     string        `bson:"category" json:"category"`
	Options      []PollOption  `bson:"options" json:"options"`
	CreatedBy    string        `bson:"created_by" json:"created_by"`
	BookmarkedBy []string      `bson:"bookmarked_by,omitempty" json:"bookmarked_by,omitempty"`
	CreatedAt    time.Time     `bson:"created_at" json:"created_at"`
}
