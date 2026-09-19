package models

import "time"

type Bookmark struct {
	UserID    string    `bson:"user_id" json:"user_id"`
	PollID    string    `bson:"poll_id" json:"poll_id"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
}
