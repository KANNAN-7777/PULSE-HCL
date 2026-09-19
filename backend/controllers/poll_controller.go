package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"pulse-backend/config"
	"pulse-backend/models"
	"pulse-backend/services"
)

func CreatePoll(c *gin.Context) {
	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	question := strings.TrimSpace(
		c.PostForm("question"),
	)

	category := strings.TrimSpace(
		c.PostForm("category"),
	)

	pollType := strings.TrimSpace(
		c.PostForm("type"),
	)

	if question == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Question is required",
		})
		return
	}

	if len(question) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Question must contain at least 3 characters",
		})
		return
	}

	if len(question) > 300 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Question cannot exceed 300 characters",
		})
		return
	}

	if category == "" {
		category = "General"
	}

	if len(category) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Category cannot exceed 50 characters",
		})
		return
	}

	if pollType == "" {
		pollType = "single"
	}

	allowedTypes := map[string]bool{
		"yesno":  true,
		"single": true,
		"rating": true,
		"image":  true,
		"open":   true,
	}

	if !allowedTypes[pollType] {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll type",
		})
		return
	}

	var optionTexts []string

	optionsJSON := strings.TrimSpace(
		c.PostForm("options"),
	)

	if optionsJSON != "" {
		if err := json.Unmarshal(
			[]byte(optionsJSON),
			&optionTexts,
		); err != nil {
			fmt.Println(
				"OPTIONS JSON ERROR:",
				err,
			)

			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Invalid options",
				"error":   err.Error(),
			})
			return
		}
	}

	options := make(
		[]models.PollOption,
		0,
	)

	for _, text := range optionTexts {
		text = strings.TrimSpace(text)

		if text == "" {
			continue
		}

		options = append(
			options,
			models.PollOption{
				ID:    bson.NewObjectID().Hex(),
				Text:  text,
				Votes: 0,
			},
		)
	}

	if pollType == "yesno" {
		options = []models.PollOption{
			{
				ID:    "yes",
				Text:  "Yes",
				Votes: 0,
			},
			{
				ID:    "no",
				Text:  "No",
				Votes: 0,
			},
		}
	}

	if pollType == "rating" {
		options = []models.PollOption{
			{
				ID:    "1",
				Text:  "1",
				Votes: 0,
			},
			{
				ID:    "2",
				Text:  "2",
				Votes: 0,
			},
			{
				ID:    "3",
				Text:  "3",
				Votes: 0,
			},
			{
				ID:    "4",
				Text:  "4",
				Votes: 0,
			},
			{
				ID:    "5",
				Text:  "5",
				Votes: 0,
			},
		}
	}

	if pollType == "single" {
		if len(options) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Please provide at least 2 options",
			})
			return
		}

		if len(options) > 6 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "You can have a maximum of 6 options",
			})
			return
		}

		seen := make(
			map[string]bool,
		)

		for _, option := range options {
			key := strings.ToLower(
				strings.TrimSpace(option.Text),
			)

			if seen[key] {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "Options must be unique",
				})
				return
			}

			seen[key] = true
		}
	}

	if pollType == "open" {
		options = []models.PollOption{}
	}

	if pollType == "image" {
		form, err := c.MultipartForm()

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Please upload poll images",
			})
			return
		}

		imageFiles := form.File["images"]

		if len(imageFiles) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Please upload at least 2 images",
			})
			return
		}

		if len(imageFiles) > 4 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "You can upload a maximum of 4 images",
			})
			return
		}

		options = make(
			[]models.PollOption,
			0,
			len(imageFiles),
		)

		uploadDir := "uploads/polls"

		if err := os.MkdirAll(
			uploadDir,
			0755,
		); err != nil {
			fmt.Println(
				"UPLOAD DIRECTORY ERROR:",
				err,
			)

			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Could not prepare image storage",
			})
			return
		}

		for index, file := range imageFiles {
			if file.Size > 5*1024*1024 {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "Each image must be smaller than 5 MB",
				})
				return
			}

			contentType := file.Header.Get(
				"Content-Type",
			)

			allowedImages := map[string]bool{
				"image/jpeg": true,
				"image/jpg":  true,
				"image/png":  true,
				"image/webp": true,
			}

			if !allowedImages[contentType] {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "Only JPG, PNG and WEBP images are allowed",
				})
				return
			}

			extension := filepath.Ext(
				file.Filename,
			)

			if extension == "" {
				switch contentType {
				case "image/png":
					extension = ".png"
				case "image/webp":
					extension = ".webp"
				default:
					extension = ".jpg"
				}
			}

			filename :=
				fmt.Sprintf(
					"%s_%d%s",
					bson.NewObjectID().Hex(),
					index,
					extension,
				)

			filePath := filepath.Join(
				uploadDir,
				filename,
			)

			if err := c.SaveUploadedFile(
				file,
				filePath,
			); err != nil {
				fmt.Println(
					"SAVE IMAGE ERROR:",
					err,
				)

				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "Could not save poll image",
				})
				return
			}

			imageURL :=
				"/uploads/polls/" + filename

			options = append(
				options,
				models.PollOption{
					ID:    bson.NewObjectID().Hex(),
					Text:  fmt.Sprintf("Image %d", index+1),
					Votes: 0,
					Image: imageURL,
				},
			)
		}
	}

	poll := models.Poll{
		ID:        bson.NewObjectID(),
		Question:  question,
		Type:      pollType,
		Category:  category,
		Options:   options,
		CreatedBy: userID,
		CreatedAt: time.Now(),
	}

	collection := config.DB.Collection(
		"polls",
	)

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	_, err := collection.InsertOne(
		ctx,
		poll,
	)

	if err != nil {
		fmt.Println(
			"CREATE POLL ERROR:",
			err,
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not create poll",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully",
		"poll":    poll,
	})
}

func GetMyPolls(c *gin.Context) {
	userID := strings.TrimSpace(c.GetString("user_id"))

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	collection := config.DB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	cursor, err := collection.Find(
		ctx,
		bson.M{
			"created_by": userID,
		},
	)

	if err != nil {
		fmt.Println("GET MY POLLS ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load polls",
		})
		return
	}

	defer cursor.Close(ctx)

	var polls []models.Poll

	if err := cursor.All(ctx, &polls); err != nil {
		fmt.Println("READ MY POLLS ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not read polls",
		})
		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}

func GetVotedPolls(c *gin.Context) {
	userID := strings.TrimSpace(c.GetString("user_id"))

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	voteCollection := config.DB.Collection("votes")
	pollCollection := config.DB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	cursor, err := voteCollection.Find(
		ctx,
		bson.M{
			"user_id": userID,
		},
	)

	if err != nil {
		fmt.Println("GET VOTED POLLS ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load voted polls",
		})
		return
	}

	defer cursor.Close(ctx)

	var votes []models.Vote

	if err := cursor.All(ctx, &votes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not read votes",
		})
		return
	}

	polls := make([]models.Poll, 0)

	for _, vote := range votes {
		pollID, err := bson.ObjectIDFromHex(vote.PollID)

		if err != nil {
			continue
		}

		var poll models.Poll

		err = pollCollection.FindOne(
			ctx,
			bson.M{
				"_id": pollID,
			},
		).Decode(&poll)

		if err != nil {
			continue
		}

		polls = append(polls, poll)
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}

func GetBookmarkedPolls(c *gin.Context) {
	userID := strings.TrimSpace(c.GetString("user_id"))

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	collection := config.DB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	cursor, err := collection.Find(
		ctx,
		bson.M{
			"bookmarked_by": userID,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load bookmarked polls",
		})
		return
	}

	defer cursor.Close(ctx)

	var polls []models.Poll

	if err := cursor.All(ctx, &polls); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not read bookmarked polls",
		})
		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}

func BookmarkPoll(c *gin.Context) {
	userID := strings.TrimSpace(c.GetString("user_id"))
	id := strings.TrimSpace(c.Param("id"))

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	pollID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	collection := config.DB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	result, err := collection.UpdateOne(
		ctx,
		bson.M{
			"_id": pollID,
		},
		bson.M{
			"$addToSet": bson.M{
				"bookmarked_by": userID,
			},
		},
	)

	if err != nil {
		fmt.Println("BOOKMARK ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not bookmark poll",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Poll not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Poll bookmarked successfully",
	})
}

func RemoveBookmark(c *gin.Context) {
	userID := strings.TrimSpace(c.GetString("user_id"))
	id := strings.TrimSpace(c.Param("id"))

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	pollID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	collection := config.DB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	result, err := collection.UpdateOne(
		ctx,
		bson.M{
			"_id": pollID,
		},
		bson.M{
			"$pull": bson.M{
				"bookmarked_by": userID,
			},
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not remove bookmark",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Poll not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Bookmark removed successfully",
	})
}

func VotePoll(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	userID := strings.TrimSpace(c.GetString("user_id"))

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	pollID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	var request struct {
		OptionID string `json:"option_id"`
		Value    string `json:"value"`
		Answer   string `json:"answer"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		fmt.Println("INVALID VOTE REQUEST:", err)

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid vote request",
		})
		return
	}

	fmt.Println("VOTE REQUEST")
	fmt.Println("Poll ID:", id)
	fmt.Println("User ID:", userID)
	fmt.Println("Option ID:", request.OptionID)
	fmt.Println("Value:", request.Value)
	fmt.Println("Answer:", request.Answer)

	collection := config.DB.Collection("polls")
	voteCollection := config.DB.Collection("votes")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var poll models.Poll

	err = collection.FindOne(
		ctx,
		bson.M{
			"_id": pollID,
		},
	).Decode(&poll)

	if err != nil {
		fmt.Println("FIND POLL ERROR:", err)

		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Poll not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load poll",
			"error":   err.Error(),
		})
		return
	}

	var existingVote models.Vote

	err = voteCollection.FindOne(
		ctx,
		bson.M{
			"poll_id": id,
			"user_id": userID,
		},
	).Decode(&existingVote)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"message": "You have already voted in this poll",
		})
		return
	}

	if err != mongo.ErrNoDocuments {
		fmt.Println("CHECK EXISTING VOTE ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not verify previous vote",
			"error":   err.Error(),
		})
		return
	}

	optionID := strings.TrimSpace(request.OptionID)

	if optionID == "" {
		optionID = strings.TrimSpace(request.Value)
	}

	if poll.Type == "open" {
		if optionID == "" {
			optionID = strings.TrimSpace(request.Answer)
		}

		if optionID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Answer is required",
			})
			return
		}
	}

	if poll.Type != "open" && optionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Option is required",
		})
		return
	}

	if poll.Type != "open" {
		found := false

		for _, option := range poll.Options {
			if strings.TrimSpace(option.ID) == optionID {
				found = true
				break
			}
		}

		if !found {
			fmt.Println("INVALID OPTION:", optionID)

			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Invalid option",
			})
			return
		}
	}

	vote := models.Vote{
		PollID:   id,
		OptionID: optionID,
		UserID:   userID,
		VotedAt:  time.Now(),
	}

	_, err = voteCollection.InsertOne(
		ctx,
		vote,
	)

	if err != nil {
		fmt.Println("INSERT VOTE ERROR:", err)

		if mongo.IsDuplicateKeyError(err) {
			c.JSON(http.StatusConflict, gin.H{
				"message": "You have already voted in this poll",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not save vote",
			"error":   err.Error(),
		})
		return
	}

	if poll.Type == "open" {
		c.JSON(http.StatusOK, gin.H{
			"message": "Response recorded successfully",
		})
		return
	}

	updateResult, err := collection.UpdateOne(
		ctx,
		bson.M{
			"_id":        pollID,
			"options.id": optionID,
		},
		bson.M{
			"$inc": bson.M{
				"options.$.votes": 1,
			},
		},
	)

	if err != nil {
		fmt.Println("UPDATE POLL COUNT ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Vote was saved but vote count could not be updated",
			"error":   err.Error(),
		})
		return
	}

	if updateResult.ModifiedCount == 0 {
		fmt.Println(
			"VOTE COUNT WAS NOT UPDATED",
			"option:",
			optionID,
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Vote was saved but selected option could not be updated",
		})
		return
	}

	votes, redisErr := services.IncrementVote(
		id,
		optionID,
	)

	if redisErr != nil {
		fmt.Println(
			"REDIS REALTIME UPDATE FAILED:",
			redisErr,
		)

		c.JSON(http.StatusOK, gin.H{
			"message":  "Vote recorded successfully",
			"realtime": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Vote recorded successfully",
		"votes":    votes,
		"realtime": true,
	})
}

func UnvotePoll(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"message": "Unvote is not implemented yet",
	})
}

func GetPoll(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))

	pollID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	collection := config.DB.Collection("polls")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var poll models.Poll

	err = collection.FindOne(
		ctx,
		bson.M{
			"_id": pollID,
		},
	).Decode(&poll)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Poll not found",
			})
			return
		}

		fmt.Println("GET POLL ERROR:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load poll",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"poll": poll,
	})
}

func GetPollVoters(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))

	if _, err := bson.ObjectIDFromHex(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	voteCollection := config.DB.Collection("votes")

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	cursor, err := voteCollection.Find(
		ctx,
		bson.M{
			"poll_id": id,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load voters",
		})
		return
	}

	defer cursor.Close(ctx)

	var votes []models.Vote

	if err := cursor.All(ctx, &votes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not read voters",
		})
		return
	}

	if votes == nil {
		votes = []models.Vote{}
	}

	c.JSON(http.StatusOK, gin.H{
		"voters": votes,
	})
}
