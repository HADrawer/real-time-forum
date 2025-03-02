package handlers

import (
	database "Real-Time/Go/DB"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]string)
var broadcast = make(chan Message)

type Message struct {
	ID         int    		`json:"id"`
	SenderID   int    		`json:"sender_id"`
	ReceiverID int    		`json:"receiver_id"`
	Username   string 		`json:"username"`
	Message    string 		`json:"message"`
	CreateTime time.Time	`json:"createdTime"`
}
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer func() {
		log.Println("Closing WebSocket connection")
		conn.Close()
	}()

	userID, loggedIn := GetUserIDFromSession(r)
	if !loggedIn {
		log.Println("User not logged in")
		conn.Close()
		return
	}
	// println(len(clients))
	user, err := database.GetUsernameFromUserID(userID)
	if err != nil {
		log.Println("Error fetching username:", err)
		conn.Close()
		return
	}

	var msg Message
	err = conn.ReadJSON(&msg)
	if err != nil {
		log.Println("Error reading username:", err)
		return
	}

	clients[conn] = user.Username
	fmt.Println(user.Username, "connected")

	for {
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Error reading message:", err)
			delete(clients, conn)
			break
		}
		println(msg.Username)
		println(msg.ReceiverID)
		println(msg.SenderID)
		println(msg.Message)
		msg.Username = user.Username
		broadcast <- msg
	}
}

func HandleMessages() {
	for {
		msg := <-broadcast

		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Println(err)
				client.Close()
				delete(clients, client)
			}
		}

	}
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	users, err := database.GetAllUsers()
	if err != nil {
		http.Error(w, "Unable to fetch users", http.StatusInternalServerError)
		return
	}
	userID, _ := GetUserIDFromSession(r)
	ALLUsers := map[string]interface{}{
		"users": users,
		"sender_id": userID,
	}

	// Send the list of users as a JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ALLUsers)
}
