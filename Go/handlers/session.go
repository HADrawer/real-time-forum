package handlers

import (
	database "Real-Time/Go/DB"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
	// "github.com/google/uuid"
)

var session = map[string]string{}

var userSession = map[string]string{}

func generateSessionID() string {
	return uuid.Must(uuid.NewV4()).String()
}

func CreateSession(w http.ResponseWriter, userID int) {
	sessionID := generateSessionID()
	var existingSessionID string
	existingSessionID, err := database.SessionChecker(existingSessionID, userID)
	if err == nil {

		err = database.DeleteSession(existingSessionID)
		if err != nil {
			http.Error(w,"Failed to delete old session", http.StatusInternalServerError )
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    "",
			Expires:  time.Now().Add(-1 * time.Hour),
			HttpOnly: true,
		})
	}

	expiresAt := time.Now().Add(24 * time.Hour)

	err = database.AddingSession(sessionID, userID,expiresAt)
	if err != nil {
        http.Error(w, "Failed to create session", http.StatusInternalServerError)
        return
    }

	http.SetCookie(w , &http.Cookie{
		Name: "session_id",
		Value: sessionID,
		Expires: expiresAt,
		HttpOnly: true,
	})
}

func GetUserIDFromSession(r *http.Request) (int , bool) {

	cookie , err := r.Cookie("session_id")
	if err != nil {
		return 0, false
	}

	var userID int
	var expiresAt time.Time

	userID , expiresAt , err = database.GetUserIDFromSession(cookie,userID,expiresAt)
	if err != nil {
        return 0, false
    }
	
	if time.Now().After(expiresAt) {
		_ = database.DeleteSession(cookie.Value)
		return 0, false
	}

	return userID , true

}

func DestroySession(w http.ResponseWriter , r *http.Request) {
	cookie, err := r.Cookie("session_id")
    if err != nil {
        return
    }

	err = database.DeleteSession(cookie.Value)
	if err != nil {
        http.Error(w, "Failed to delete session", http.StatusInternalServerError)
        return
    }
	http.SetCookie(w, &http.Cookie{
        Name:     "session_id",
        Value:    "",
        Expires:  time.Now().Add(-1 * time.Hour),
        HttpOnly: true,
    })
}