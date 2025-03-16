package handlers

import (
	database "Real-Time/Go/DB"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

var clients = make(map[int]*websocket.Conn)



type MessageJson struct {
	ID         int       `json:"id"`
	SenderID   int       `json:"sender_id"`
	ReceiverID int       `json:"receiver_id"`
	Username   string    `json:"username"`
	Message    string    `json:"message"`
	CreateTime time.Time `json:"createdTime"`
	IsRead	   int 		 `json:"isRead"`
}
type UserJson struct {
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
	userID, loggedIn := GetUserIDFromSession(r)
	if !loggedIn {
		log.Println("User not logged in")
		conn.Close()
		return
	}

	user, err := database.GetUsernameFromUserID(userID)
	if err != nil {
		log.Println("Error fetching username:", err)
		conn.Close()
		return
	}

	clients[userID] = conn
	fmt.Println(user.Username, "connected")

	broadcastUserListUpdate()


	defer func() {

		log.Println("Closing WebSocket connection")
		delete(clients, userID)
		conn.Close()

		broadcastUserListUpdate()

	}()

	for {
		var msg MessageJson
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Error Receiving message", err)
			break
		}
		SendMessage(user.ID, msg.ReceiverID, user.Username, msg.Message)
	}
}

func SendMessage(senderID int, receiverID int, username string, message string) {
	msg := MessageJson{
		Username: username,
		SenderID:   senderID,
		ReceiverID: receiverID,
		Message:    message,
		CreateTime: time.Now(),
	}
	
	

	if conn, ok := clients[receiverID]; ok {
		conn.WriteJSON(map[string]interface{}{
			"type": "message",
			"data": msg,
		})
	}else {
		if conn , ok := clients[senderID]; ok {
			conn.WriteJSON(map[string]interface{}{
				"type": "offline",
				"data": "the user is offline , come later",
			})
			return
		}
	}




	err := database.SaveMessage(msg.SenderID,msg.ReceiverID,msg.Username ,msg.Message,msg.CreateTime)
	if err != nil {
		log.Printf("Error Saving message " , err)
	}


	broadcastUserListUpdate()

}

func broadcastUserListUpdate() {
	for userID, conn := range clients {
		userList, err := GetUsersForClient(userID)
		if err != nil {
			log.Printf("Error fetching user list for client %d: %v", userID, err)
            continue
		}

		err = conn.WriteJSON(map[string]interface{}{
			"type": "userListUpdate",
			"data": userList,
		})
		if err != nil {
			log.Printf("Error sending user list update to %d: %v", userID, err)
			conn.Close()
			delete(clients, userID)
		}
		
		
	}

}

func GetUsersForClient(userID int) (map[string]interface{}, error) {
	users, err := database.GetAllUsers()
    if err != nil {
        return nil, err
    }
	
	
	var userListWithMessages []map[string]interface{}
	for _, user := range users {
		
		if user.ID != userID {
			lastMessage , err := GetLastMessage(userID , user.ID)
			if err != nil {
				log.Println("Error fetching last message:", err)
				continue
				
			}
			isOnline := false
			if _, ok := clients[user.ID]; ok {
				isOnline = true
			}
			userData := map[string]interface{}{
				"user":	user,
				"lastMessage": lastMessage,
				"isOnline": isOnline,
			}
			userListWithMessages = append(userListWithMessages, userData)
		}
	}

	type userWithMessageStatus struct {
		index int
		hasMessage bool
		messageTime time.Time
		username string
	}

	userStatuses := make([]userWithMessageStatus, len(userListWithMessages))
	for i , userData := range userListWithMessages {
		status := userWithMessageStatus{
			index: i,
			hasMessage: false,
			username: userData["user"].(database.User).Username,
		}

		if userData["lastMessage"] != nil {
			if msg, ok := userData["lastMessage"].(*MessageJson); ok && msg != nil {
				status.hasMessage = true
				status.messageTime = msg.CreateTime
			}
		}
		userStatuses[i] = status
	}


	sort.Slice(userStatuses , func(i, j int) bool {
		if userStatuses[i].hasMessage && userStatuses[j].hasMessage {
			return userStatuses[i].messageTime.After(userStatuses[j].messageTime)
		}

		if userStatuses[i].hasMessage {
			return true
		}
		if userStatuses[j].hasMessage {
			return false
		}
		
		
	
		return userStatuses[i].username < userStatuses[j].username
	})
	sortedList := make([]map[string]interface{}, len(userListWithMessages))
	for i, status := range userStatuses {
		sortedList[i] = userListWithMessages[status.index]
	}
	return map[string]interface{}{
		"users": sortedList,
		"sender_id": userID,
	} , nil
}



func GetUsers(w http.ResponseWriter, r *http.Request) {
	users, err := database.GetAllUsers()
	if err != nil {
		http.Error(w, "Unable to fetch users", http.StatusInternalServerError)
		return
	}

	userID, _ := GetUserIDFromSession(r)
	
	var userListWithMessages []map[string]interface{}
	for _, user := range users {
		if user.ID != userID {
			lastMessage , err := GetLastMessage(userID , user.ID)
			if err != nil {
				log.Println("Error fetching last message:", err)
				continue
				
			}
			isOnline := false
			if _, ok := clients[user.ID]; ok {
				isOnline = true
			}
			userData := map[string]interface{}{
				"user":	user,
				"lastMessage": lastMessage,
				"isOnline": isOnline,
			}
			userListWithMessages = append(userListWithMessages, userData)
		}
	}


	type userWithMessageStatus struct {
		index int
		hasMessage bool
		messageTime time.Time
		username string
	}

	userStatuses := make([]userWithMessageStatus, len(userListWithMessages))
	for i , userData := range userListWithMessages {
		status := userWithMessageStatus{
			index: i,
			hasMessage: false,
			username: userData["user"].(database.User).Username,
		}

		if userData["lastMessage"] != nil {
			if msg, ok := userData["lastMessage"].(*MessageJson); ok && msg != nil {
				status.hasMessage = true
				status.messageTime = msg.CreateTime
			}
		}
		userStatuses[i] = status
	}


	sort.Slice(userStatuses , func(i, j int) bool {
		if userStatuses[i].hasMessage && userStatuses[j].hasMessage {
			return userStatuses[i].messageTime.After(userStatuses[j].messageTime)
		}

		if userStatuses[i].hasMessage {
			return true
		}
		if userStatuses[j].hasMessage {
			return false
		}
		
		
	
		return userStatuses[i].username < userStatuses[j].username
	})
	sortedList := make([]map[string]interface{}, len(userListWithMessages))
	for i, status := range userStatuses {
		sortedList[i] = userListWithMessages[status.index]
	}

	ALLUsers := map[string]interface{}{
		"users": sortedList,
		"sender_id": userID,
	}

	// Send the list of users as a JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ALLUsers)
}




func LoadMessages(w http.ResponseWriter,r *http.Request) {
	userID, _ := GetUserIDFromSession(r)
	userID2_String := r.URL.Query().Get("receiver_id")

	userID2 , _ := strconv.Atoi(userID2_String)
	messages , err := database.GetMessages(userID, userID2)
	if err != nil {
		log.Printf(" Error Load Messages : " , err)
	}

	json.NewEncoder(w).Encode(messages)
}
// GetLastMessage fetches the last message between userID and the target user
func GetLastMessage(userID, targetID int) (*MessageJson, error) {
	messages, err := database.GetMessages(userID, targetID)
	if err != nil {
		return nil, err
	}


	if len(messages) > 0 {
		lastMessage := messages[len(messages)-1]

		return &MessageJson{
			ID:         lastMessage.ID,
			SenderID:   lastMessage.Sender_ID,
			ReceiverID: lastMessage.Receiver_ID,
			Username:   lastMessage.Username,
			Message:    lastMessage.Content,
			CreateTime: lastMessage.Created_at,
			IsRead:		lastMessage.IsRead,
		}, nil
	}
	return nil, nil // No messages found
}

func MarkMessagesAsRead(w http.ResponseWriter, r *http.Request) {
	var data struct {
		SenderID int `json:"sender_id"`
		ReceiverID int `json:"receiver_id"`
	}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid request data", http.StatusBadRequest)
		return
	}

	
	err = database.MarkMessagesAsRead(data.SenderID, data. ReceiverID)
	if err != nil {
		http.Error(w, "Error marking messages as read", http.StatusInternalServerError)
		return
	}
	
	if conn, ok := clients[data.SenderID]; ok {
		conn.WriteJSON(map[string]interface{}{
			"type": "messagesRead",
			"data": map[string]interface{}{
				"receiver_id" : data.ReceiverID,
			},
		})
	}
	w.WriteHeader(http.StatusOK)
}