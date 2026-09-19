package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type OTP struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Email          string        `bson:"email" json:"email"`
	OTP            string        `bson:"otp" json:"-"`
	Name           string        `bson:"name" json:"name"`
	Username       string        `bson:"username" json:"username"`
	Password       string        `bson:"password" json:"-"`
	ProfilePicture string        `bson:"profile_picture,omitempty" json:"profile_picture,omitempty"`
	ExpiresAt      time.Time     `bson:"expires_at" json:"expires_at"`
	CreatedAt      time.Time     `bson:"created_at" json:"created_at"`
}
