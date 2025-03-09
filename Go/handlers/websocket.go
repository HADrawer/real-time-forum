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
	defer func() {

		log.Println("Closing WebSocket connection")
		delete(clients, userID)
		conn.Close()

	}()
	clients[userID] = conn
	fmt.Println(user.Username, "connected")

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
	

	err := database.SaveMessage(msg.SenderID,msg.ReceiverID,msg.Username ,msg.Message,msg.CreateTime)
	if err != nil {
		log.Printf("Error Saving message " , err)
	}

	users := map[int]bool{senderID:true , receiverID:true}
	for userID := range users {
		if conn, ok := clients[userID]; ok {
			conn.WriteJSON(map[string]interface{}{
				"type": "message",
				"data": msg,
			})
		}
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

		conn.WriteJSON(map[string]interface{}{
			"type": "userListUpdate",
			"data": userList,
		})
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
			userData := map[string]interface{}{
				"user":	user,
				"lastMessage": lastMessage,
			}
			userListWithMessages = append(userListWithMessages, userData)
		}
	}


	sort.Slice(userListWithMessages , func(i, j int) bool {
		lastMessageI := userListWithMessages[i]["lastMessage"]
		lastMessageJ := userListWithMessages[j]["lastMessage"]

		if lastMessageI == nil && lastMessageJ == nil {
			return userListWithMessages[i]["user"].(database.User).Username < userListWithMessages[j]["user"].(database.User).Username
		}
		if lastMessageI == nil {
			return false
		}
		if lastMessageJ == nil {
			return true
		}

		msgI , okI := lastMessageI.(*MessageJson)
		msgJ , okJ := lastMessageJ.(*MessageJson)

		if !okI || !okJ {
			log.Println("Type assertion failed for lastMessage")
			return false
		}
		if msgI == nil || msgJ == nil {
			return false
		}

		return msgI.CreateTime.After(msgJ.CreateTime)
	})
	return map[string]interface{}{
		"users": userListWithMessages,
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
			userData := map[string]interface{}{
				"user":	user,
				"lastMessage": lastMessage,
			}
			userListWithMessages = append(userListWithMessages, userData)
		}
	}


	sort.Slice(userListWithMessages , func(i, j int) bool {
		lastMessageI := userListWithMessages[i]["lastMessage"]
		lastMessageJ := userListWithMessages[j]["lastMessage"]

		if lastMessageI == nil && lastMessageJ == nil {
			return userListWithMessages[i]["user"].(database.User).Username < userListWithMessages[j]["user"].(database.User).Username
		}
		if lastMessageI == nil {
			return false
		}
		if lastMessageJ == nil {
			return true
		}

		msgI , okI := lastMessageI.(*MessageJson)
		msgJ , okJ := lastMessageJ.(*MessageJson)

		if !okI || !okJ {
			log.Println("Type assertion failed for lastMessage")
			return false
		}
		if msgI == nil || msgJ == nil {
			return false
		}

		return msgI.CreateTime.After(msgJ.CreateTime)
	})

	ALLUsers := map[string]interface{}{
		"users": userListWithMessages,
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
		}, nil
	}
	return nil, nil // No messages found
}
