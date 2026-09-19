package models

import "go.mongodb.org/mongo-driver/v2/bson"

type User struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name           string        `bson:"name" json:"name"`
	Username       string        `bson:"username" json:"username"`
	Email          string        `bson:"email" json:"email"`
	Password       string        `bson:"password" json:"-"`
	Role           string        `bson:"role" json:"role"`
	ProfilePicture string        `bson:"profile_picture,omitempty" json:"profile_picture,omitempty"`
}
