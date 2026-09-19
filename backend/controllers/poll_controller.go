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
)

type livePollUpdate struct {
	PollID   string `json:"poll_id"`
	OptionID string `json:"option_id"`
	Votes    int    `json:"votes"`
}

func publishPollUpdate(
	pollID string,
	optionID string,
	votes int,
) error {
	if config.RedisClient == nil {
		return fmt.Errorf("redis client is not initialized")
	}

	data, err := json.Marshal(
		livePollUpdate{
			PollID:   pollID,
			OptionID: optionID,
			Votes:    votes,
		},
	)

	if err != nil {
		return err
	}

	channel := fmt.Sprintf(
		"poll:%s",
		pollID,
	)

	return config.RedisClient.
		Publish(
			context.Background(),
			channel,
			data,
		).
		Err()
}

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
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Invalid options",
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

		if len(text) > 200 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Option cannot exceed 200 characters",
			})
			return
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
			{ID: "1", Text: "1", Votes: 0},
			{ID: "2", Text: "2", Votes: 0},
			{ID: "3", Text: "3", Votes: 0},
			{ID: "4", Text: "4", Votes: 0},
			{ID: "5", Text: "5", Votes: 0},
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

		seen := make(map[string]bool)

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

			contentType := strings.ToLower(
				file.Header.Get("Content-Type"),
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

			extension := strings.ToLower(
				filepath.Ext(file.Filename),
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

			filename := fmt.Sprintf(
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
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "Could not save poll image",
				})
				return
			}

			options = append(
				options,
				models.PollOption{
					ID:    bson.NewObjectID().Hex(),
					Text:  fmt.Sprintf("Image %d", index+1),
					Votes: 0,
					Image: "/uploads/polls/" + filename,
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

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database is not connected",
		})
		return
	}

	collection := config.DB.Collection("polls")

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
	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	cursor, err := config.DB.
		Collection("polls").
		Find(
			ctx,
			bson.M{
				"created_by": userID,
			},
		)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load polls",
		})
		return
	}

	defer cursor.Close(ctx)

	var polls []models.Poll

	if err := cursor.All(
		ctx,
		&polls,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not read polls",
		})
		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	votesCollection := config.DB.Collection("votes")

	result := make(
		[]gin.H,
		0,
		len(polls),
	)

	for _, poll := range polls {
		totalVotes := 0

		if strings.EqualFold(
			strings.TrimSpace(poll.Type),
			"open",
		) {
			count, countErr := votesCollection.CountDocuments(
				ctx,
				bson.M{
					"poll_id": poll.ID.Hex(),
				},
			)

			if countErr == nil {
				totalVotes = int(count)
			}
		} else {
			for _, option := range poll.Options {
				totalVotes += option.Votes
			}
		}

		result = append(
			result,
			gin.H{
				"id":            poll.ID,
				"question":      poll.Question,
				"type":          poll.Type,
				"category":      poll.Category,
				"options":       poll.Options,
				"created_by":    poll.CreatedBy,
				"created_at":    poll.CreatedAt,
				"bookmarked_by": poll.BookmarkedBy,
				"total_votes":   totalVotes,
			},
		)
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": result,
	})
}

func GetVotedPolls(c *gin.Context) {
	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	votesCollection := config.DB.Collection("votes")
	pollsCollection := config.DB.Collection("polls")

	cursor, err := votesCollection.Find(
		ctx,
		bson.M{
			"user_id": userID,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get voted polls",
		})
		return
	}

	defer cursor.Close(ctx)

	var votes []models.Vote

	if err := cursor.All(
		ctx,
		&votes,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to read votes",
		})
		return
	}

	result := make([]gin.H, 0)

	for _, vote := range votes {
		pollObjectID, err := bson.ObjectIDFromHex(
			vote.PollID,
		)

		if err != nil {
			continue
		}

		var poll models.Poll

		err = pollsCollection.FindOne(
			ctx,
			bson.M{
				"_id": pollObjectID,
			},
		).Decode(&poll)

		if err != nil {
			continue
		}

		totalVotes := 0
		selectedOption := ""

		for _, option := range poll.Options {
			totalVotes += option.Votes

			if option.ID == vote.OptionID {
				selectedOption = option.Text
			}
		}

		if strings.EqualFold(
			strings.TrimSpace(poll.Type),
			"open",
		) {
			totalResponseCount, countErr :=
				votesCollection.CountDocuments(
					ctx,
					bson.M{
						"poll_id": vote.PollID,
					},
				)

			if countErr == nil {
				totalVotes = int(totalResponseCount)
			}
		}

		selectedPercentage := 0

		if totalVotes > 0 && vote.OptionID != "" {
			for _, option := range poll.Options {
				if option.ID == vote.OptionID {
					selectedPercentage =
						(option.Votes * 100) /
							totalVotes
					break
				}
			}
		}

		result = append(
			result,
			gin.H{
				"poll":                poll,
				"options":             poll.Options,
				"total_votes":         totalVotes,
				"selected_option":     selectedOption,
				"selected_option_id":  vote.OptionID,
				"selected_percentage": selectedPercentage,
				"answer":              vote.Answer,
			},
		)
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": result,
	})
}

func GetBookmarkedPolls(c *gin.Context) {
	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	cursor, err := config.DB.
		Collection("polls").
		Find(
			ctx,
			bson.M{
				"bookmarked_by": userID,
			},
		)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get bookmarked polls",
		})
		return
	}

	defer cursor.Close(ctx)

	var polls []models.Poll

	if err := cursor.All(
		ctx,
		&polls,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to read bookmarked polls",
		})
		return
	}

	result := make([]gin.H, 0)

	votesCollection := config.DB.Collection("votes")

	for _, poll := range polls {
		totalVotes := 0

		if strings.EqualFold(
			strings.TrimSpace(poll.Type),
			"open",
		) {
			count, countErr := votesCollection.CountDocuments(
				ctx,
				bson.M{
					"poll_id": poll.ID.Hex(),
				},
			)

			if countErr == nil {
				totalVotes = int(count)
			}
		} else {
			for _, option := range poll.Options {
				totalVotes += option.Votes
			}
		}

		result = append(
			result,
			gin.H{
				"poll":        poll,
				"options":     poll.Options,
				"total_votes": totalVotes,
			},
		)
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": result,
	})
}

func BookmarkPoll(c *gin.Context) {
	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	id := strings.TrimSpace(
		c.Param("id"),
	)

	pollID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	result, err := config.DB.
		Collection("polls").
		UpdateOne(
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
		"message":    "Poll bookmarked successfully",
		"bookmarked": true,
	})
}

func RemoveBookmark(c *gin.Context) {
	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	id := strings.TrimSpace(
		c.Param("id"),
	)

	pollID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	result, err := config.DB.
		Collection("polls").
		UpdateOne(
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
		"message":    "Bookmark removed successfully",
		"bookmarked": false,
	})
}

/*
========================================================
VOTE POLL
========================================================

NORMAL POLLS
- One response per user.
- User can switch option.
- Selecting the same option again does nothing.

OPEN POLLS
- Unlimited responses per user.
- Every response creates a NEW vote document.
- Every response stores its Answer.
========================================================
*/

func VotePoll(c *gin.Context) {
	id := strings.TrimSpace(
		c.Param("id"),
	)

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Poll ID is required",
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

	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Please login to vote",
		})
		return
	}

	var request struct {
		OptionID string `json:"option_id" form:"option_id"`
		Value    string `json:"value" form:"value"`
		Answer   string `json:"answer" form:"answer"`
	}

	if err := c.ShouldBind(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid vote request",
		})
		return
	}

	request.OptionID = strings.TrimSpace(
		request.OptionID,
	)

	request.Answer = strings.TrimSpace(
		request.Answer,
	)

	if config.DB == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database is not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	pollsCollection := config.DB.Collection("polls")
	votesCollection := config.DB.Collection("votes")

	var poll models.Poll

	err = pollsCollection.
		FindOne(
			ctx,
			bson.M{
				"_id": pollID,
			},
		).
		Decode(&poll)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Poll not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Unable to load poll",
		})
		return
	}

	// ==================================================
	// OPEN POLL
	// ==================================================
	//
	// IMPORTANT:
	//
	// We DO NOT search for an existing vote here.
	//
	// Every submission creates a NEW Vote document.
	//
	// This allows:
	//
	// Response 1
	// Response 2
	// Response 3
	// ...
	//
	// from the same user.
	// ==================================================

	if strings.EqualFold(
		strings.TrimSpace(poll.Type),
		"open",
	) {
		if request.Answer == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Please enter your response",
			})
			return
		}

		if len(request.Answer) > 2000 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Response cannot exceed 2000 characters",
			})
			return
		}

		newResponse := models.Vote{
			ID:       bson.NewObjectID(),
			PollID:   id,
			UserID:   userID,
			OptionID: "",
			Answer:   request.Answer,
			VotedAt:  time.Now(),
		}

		_, err = votesCollection.InsertOne(
			ctx,
			newResponse,
		)

		if err != nil {
			fmt.Println(
				"OPEN POLL RESPONSE ERROR:",
				err,
			)

			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to record response",
			})
			return
		}

		totalResponses, err :=
			votesCollection.CountDocuments(
				ctx,
				bson.M{
					"poll_id": id,
				},
			)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Response saved but count could not be loaded",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":         "Response recorded successfully",
			"changed":         true,
			"realtime":        false,
			"total_responses": totalResponses,
			"total_votes":     totalResponses,
			"response_id":     newResponse.ID.Hex(),
			"poll":            poll,
		})

		return
	}

	// ==================================================
	// NORMAL POLL
	// ==================================================

	if request.OptionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Please select an option",
		})
		return
	}

	optionExists := false

	for _, option := range poll.Options {
		if strings.TrimSpace(option.ID) ==
			request.OptionID {

			optionExists = true
			break
		}
	}

	if !optionExists {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Selected option does not exist",
		})
		return
	}

	var existingVote models.Vote

	findVoteErr := votesCollection.
		FindOne(
			ctx,
			bson.M{
				"poll_id": id,
				"user_id": userID,
			},
		).
		Decode(&existingVote)

	hasExistingVote := findVoteErr == nil

	if findVoteErr != nil &&
		findVoteErr != mongo.ErrNoDocuments {

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Unable to check previous vote",
		})
		return
	}

	// ==================================================
	// SAME OPTION
	// ==================================================

	if hasExistingVote &&
		existingVote.OptionID == request.OptionID {

		var currentPoll models.Poll

		err = pollsCollection.
			FindOne(
				ctx,
				bson.M{
					"_id": pollID,
				},
			).
			Decode(&currentPoll)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to load current poll",
			})
			return
		}

		currentVotes := 0
		totalVotes := 0

		for _, option := range currentPoll.Options {
			totalVotes += option.Votes

			if option.ID == request.OptionID {
				currentVotes = option.Votes
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message":            "Vote already selected",
			"votes":              currentVotes,
			"total_votes":        totalVotes,
			"changed":            false,
			"poll":               currentPoll,
			"realtime":           false,
			"selected_option_id": request.OptionID,
		})

		return
	}

	// ==================================================
	// FIRST NORMAL VOTE
	// ==================================================

	if !hasExistingVote {
		updateResult, err := pollsCollection.
			UpdateOne(
				ctx,
				bson.M{
					"_id": pollID,
					"options": bson.M{
						"$elemMatch": bson.M{
							"id": request.OptionID,
							"votes": bson.M{
								"$gte": 0,
							},
						},
					},
				},
				bson.M{
					"$inc": bson.M{
						"options.$.votes": 1,
					},
				},
			)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to update vote count",
			})
			return
		}

		if updateResult.MatchedCount == 0 ||
			updateResult.ModifiedCount == 0 {

			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Selected option could not be updated",
			})
			return
		}

		vote := models.Vote{
			ID:       bson.NewObjectID(),
			PollID:   id,
			UserID:   userID,
			OptionID: request.OptionID,
			VotedAt:  time.Now(),
		}

		_, err = votesCollection.InsertOne(
			ctx,
			vote,
		)

		if err != nil {
			_, _ = pollsCollection.UpdateOne(
				ctx,
				bson.M{
					"_id": pollID,
					"options": bson.M{
						"$elemMatch": bson.M{
							"id": request.OptionID,
							"votes": bson.M{
								"$gt": 0,
							},
						},
					},
				},
				bson.M{
					"$inc": bson.M{
						"options.$.votes": -1,
					},
				},
			)

			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to save vote",
			})
			return
		}
	} else {

		// ==================================================
		// SWITCH NORMAL VOTE
		// ==================================================

		oldOptionID := strings.TrimSpace(
			existingVote.OptionID,
		)

		if oldOptionID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Invalid previous vote",
			})
			return
		}

		oldUpdateResult, err := pollsCollection.
			UpdateOne(
				ctx,
				bson.M{
					"_id": pollID,
					"options": bson.M{
						"$elemMatch": bson.M{
							"id": oldOptionID,
							"votes": bson.M{
								"$gt": 0,
							},
						},
					},
				},
				bson.M{
					"$inc": bson.M{
						"options.$.votes": -1,
					},
				},
			)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to remove previous vote",
			})
			return
		}

		if oldUpdateResult.MatchedCount == 0 ||
			oldUpdateResult.ModifiedCount == 0 {

			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Previous option count could not be updated",
			})
			return
		}

		newUpdateResult, err := pollsCollection.
			UpdateOne(
				ctx,
				bson.M{
					"_id": pollID,
					"options": bson.M{
						"$elemMatch": bson.M{
							"id": request.OptionID,
							"votes": bson.M{
								"$gte": 0,
							},
						},
					},
				},
				bson.M{
					"$inc": bson.M{
						"options.$.votes": 1,
					},
				},
			)

		if err != nil {
			_, _ = pollsCollection.UpdateOne(
				ctx,
				bson.M{
					"_id": pollID,
					"options": bson.M{
						"$elemMatch": bson.M{
							"id": oldOptionID,
						},
					},
				},
				bson.M{
					"$inc": bson.M{
						"options.$.votes": 1,
					},
				},
			)

			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to add new vote",
			})
			return
		}

		if newUpdateResult.MatchedCount == 0 ||
			newUpdateResult.ModifiedCount == 0 {

			_, _ = pollsCollection.UpdateOne(
				ctx,
				bson.M{
					"_id": pollID,
					"options": bson.M{
						"$elemMatch": bson.M{
							"id": oldOptionID,
						},
					},
				},
				bson.M{
					"$inc": bson.M{
						"options.$.votes": 1,
					},
				},
			)

			c.JSON(http.StatusBadRequest, gin.H{
				"message": "New option could not be updated",
			})
			return
		}

		_, err = votesCollection.UpdateOne(
			ctx,
			bson.M{
				"_id": existingVote.ID,
			},
			bson.M{
				"$set": bson.M{
					"option_id": request.OptionID,
					"voted_at":  time.Now(),
				},
			},
		)

		if err != nil {
			_, _ = pollsCollection.UpdateOne(
				ctx,
				bson.M{
					"_id": pollID,
					"options": bson.M{
						"$elemMatch": bson.M{
							"id": request.OptionID,
						},
					},
				},
				bson.M{
					"$inc": bson.M{
						"options.$.votes": -1,
					},
				},
			)

			_, _ = pollsCollection.UpdateOne(
				ctx,
				bson.M{
					"_id": pollID,
					"options": bson.M{
						"$elemMatch": bson.M{
							"id": oldOptionID,
						},
					},
				},
				bson.M{
					"$inc": bson.M{
						"options.$.votes": 1,
					},
				},
			)

			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to update vote",
			})
			return
		}
	}

	// ==================================================
	// LOAD UPDATED NORMAL POLL
	// ==================================================

	var updatedPoll models.Poll

	err = pollsCollection.
		FindOne(
			ctx,
			bson.M{
				"_id": pollID,
			},
		).
		Decode(&updatedPoll)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Vote saved but unable to load updated poll",
		})
		return
	}

	updatedVotes := 0
	totalVotes := 0

	for _, option := range updatedPoll.Options {
		totalVotes += option.Votes

		if option.ID == request.OptionID {
			updatedVotes = option.Votes
		}
	}

	realtime := false

	if err := publishPollUpdate(
		id,
		request.OptionID,
		updatedVotes,
	); err == nil {
		realtime = true
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "Vote updated successfully",
		"votes":              updatedVotes,
		"total_votes":        totalVotes,
		"poll":               updatedPoll,
		"realtime":           realtime,
		"changed":            true,
		"selected_option_id": request.OptionID,
	})
}

func UnvotePoll(c *gin.Context) {
	id := strings.TrimSpace(
		c.Param("id"),
	)

	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

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

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	pollsCollection := config.DB.Collection("polls")
	votesCollection := config.DB.Collection("votes")

	var existingVote models.Vote

	err = votesCollection.
		FindOne(
			ctx,
			bson.M{
				"poll_id": id,
				"user_id": userID,
			},
		).
		Decode(&existingVote)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusOK, gin.H{
				"message": "No vote to remove",
				"changed": false,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Unable to find vote",
		})
		return
	}

	// Open poll responses do not have option counts.
	if existingVote.OptionID == "" {
		_, err = votesCollection.DeleteOne(
			ctx,
			bson.M{
				"_id": existingVote.ID,
			},
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Unable to remove response",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Response removed successfully",
			"changed": true,
		})
		return
	}

	updateResult, err := pollsCollection.
		UpdateOne(
			ctx,
			bson.M{
				"_id": pollID,
				"options": bson.M{
					"$elemMatch": bson.M{
						"id": existingVote.OptionID,
						"votes": bson.M{
							"$gt": 0,
						},
					},
				},
			},
			bson.M{
				"$inc": bson.M{
					"options.$.votes": -1,
				},
			},
		)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Unable to decrease vote count",
		})
		return
	}

	if updateResult.MatchedCount == 0 ||
		updateResult.ModifiedCount == 0 {

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Vote count could not be updated",
		})
		return
	}

	_, err = votesCollection.DeleteOne(
		ctx,
		bson.M{
			"_id": existingVote.ID,
		},
	)

	if err != nil {
		_, _ = pollsCollection.UpdateOne(
			ctx,
			bson.M{
				"_id": pollID,
				"options": bson.M{
					"$elemMatch": bson.M{
						"id": existingVote.OptionID,
					},
				},
			},
			bson.M{
				"$inc": bson.M{
					"options.$.votes": 1,
				},
			},
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Unable to remove vote",
		})
		return
	}

	var updatedPoll models.Poll

	err = pollsCollection.
		FindOne(
			ctx,
			bson.M{
				"_id": pollID,
			},
		).
		Decode(&updatedPoll)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Vote removed but failed to load poll",
		})
		return
	}

	totalVotes := 0
	selectedVotes := 0

	for _, option := range updatedPoll.Options {
		totalVotes += option.Votes

		if option.ID == existingVote.OptionID {
			selectedVotes = option.Votes
		}
	}

	realtime := false

	if err := publishPollUpdate(
		id,
		existingVote.OptionID,
		selectedVotes,
	); err == nil {
		realtime = true
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Vote removed successfully",
		"changed":     true,
		"total_votes": totalVotes,
		"poll":        updatedPoll,
		"realtime":    realtime,
	})
}

func GetPoll(c *gin.Context) {
	id := strings.TrimSpace(
		c.Param("id"),
	)

	pollID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	userID := strings.TrimSpace(
		c.GetString("user_id"),
	)

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	var poll models.Poll

	err = config.DB.
		Collection("polls").
		FindOne(
			ctx,
			bson.M{
				"_id": pollID,
			},
		).
		Decode(&poll)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Poll not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not load poll",
		})
		return
	}

	isOpenPoll := strings.EqualFold(
		strings.TrimSpace(poll.Type),
		"open",
	)

	/*
		For normal polls:
		has_voted = whether the user already selected an option.

		For open polls:
		has_voted is ALWAYS false because the user
		can submit multiple responses.
	*/

	hasVoted := false
	selectedOptionID := ""

	if userID != "" && !isOpenPoll {
		var existingVote models.Vote

		err = config.DB.
			Collection("votes").
			FindOne(
				ctx,
				bson.M{
					"poll_id": id,
					"user_id": userID,
				},
			).
			Decode(&existingVote)

		if err == nil {
			hasVoted = true
			selectedOptionID = existingVote.OptionID
		} else if err != mongo.ErrNoDocuments {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Could not check vote status",
			})
			return
		}
	}

	totalVotes := 0

	if isOpenPoll {
		count, countErr :=
			config.DB.
				Collection("votes").
				CountDocuments(
					ctx,
					bson.M{
						"poll_id": id,
					},
				)

		if countErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Could not count responses",
			})
			return
		}

		totalVotes = int(count)
	} else {
		for _, option := range poll.Options {
			totalVotes += option.Votes
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"poll":               poll,
		"has_voted":          hasVoted,
		"selected_option_id": selectedOptionID,
		"total_votes":        totalVotes,
		"total_responses":    totalVotes,
		"is_open":            isOpenPoll,
	})
}

func GetPollVoters(c *gin.Context) {
	id := strings.TrimSpace(
		c.Param("id"),
	)

	if _, err := bson.ObjectIDFromHex(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		c.Request.Context(),
		10*time.Second,
	)
	defer cancel()

	cursor, err := config.DB.
		Collection("votes").
		Find(
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

	if err := cursor.All(
		ctx,
		&votes,
	); err != nil {
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
