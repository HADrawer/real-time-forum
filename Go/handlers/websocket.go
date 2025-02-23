package handlers

import (
	database "Real-Time/Go/DB"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]string)
var broadcast = make(chan Message)

type Message struct {
	Username string `json:"username"`
	Message  string `json:"message"`
}
type User struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"email"`
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

	var msg Message
	err = conn.ReadJSON(&msg)
	if err != nil {
		log.Println("Error reading username:", err)	
			return
	}

	clients[conn] = msg.Username
	fmt.Println(msg.Username, "connected")

	for {
		err := conn.ReadJSON(&msg)
		if err != nil {
            log.Println("Error reading message:", err)		
			delete(clients, conn)
			break
		}

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

	// Send the list of users as a JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}
