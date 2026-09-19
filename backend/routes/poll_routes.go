package routes

import (
	"github.com/gin-gonic/gin"

	"pulse-backend/controllers"
	"pulse-backend/middleware"
)

func PollRoutes(router *gin.Engine) {
	polls := router.Group("/api/polls")

	// All poll creator/user operations require login.
	polls.Use(middleware.AuthMiddleware())

	// Create poll
	polls.POST("", controllers.CreatePoll)

	// Get polls created by logged-in user
	polls.GET("/my", controllers.GetMyPolls)

	// Get polls voted by logged-in user
	polls.GET("/voted", controllers.GetVotedPolls)

	// Get bookmarked polls
	polls.GET("/bookmarked", controllers.GetBookmarkedPolls)

	// Get individual poll
	polls.GET("/:id", controllers.GetPoll)

	// Vote
	polls.POST("/:id/vote", controllers.VotePoll)

	// Unvote
	polls.DELETE("/:id/vote", controllers.UnvotePoll)

	// Bookmark
	polls.POST("/:id/bookmark", controllers.BookmarkPoll)

	// Remove bookmark
	polls.DELETE("/:id/bookmark", controllers.RemoveBookmark)

	// Get voters of a poll
	polls.GET("/:id/voters", controllers.GetPollVoters)
}
