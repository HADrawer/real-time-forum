package database

import (
	"database/sql"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/glebarez/sqlite"
)

var db *sql.DB
var ErrUserExists = errors.New("user already exists")

type User struct {
	ID        int
	Username  string
	FirstName string
	LastName  string
	Age       string
	Gender    string
	Email     string
	Password  string
}

// Post structure
type Post struct {
	ID         int
	UserID     int
	Title      string
	Content    string
	Author     string
	Category   []Category
}

// Comment structure
type Comment struct {
	ID         int
	User_ID    int
	Post_id    int
	Content    string
	Author     string
	Created_at string
}
type Category struct {
	ID   int
	Name string
}
type Message struct {
	ID			int
	Username	string
	Sender_ID 	int
	Receiver_ID int
	Content		string
	Created_at	time.Time
	IsRead 		int
}

func Init() {
	var err error

	dir := "./Database/"
	fileName := "forum.db"
	schemesDir := "./Database/schema/"
	isNewDB := !fileExists(filepath.Join(dir, fileName))
	if isNewDB {
		err := os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			log.Fatal(err)
		}
	}

	enableForeignKeys := "?_foreign_keys=on&cache=shared&mode=rwc"
	dataSourceName := filepath.Join(dir, fileName) + enableForeignKeys

	db, err = sql.Open("sqlite", dataSourceName)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec("PRAGMA journal_mode=WAL")
	if err != nil {
		log.Fatal(err)
	}

	if isNewDB {
		if err = prepareDB(db, schemesDir); err != nil {
			log.Fatal(err)
		}
	}
	log.Println("Database connected and tables created successfully")

}

func fileExists(fileName string) bool {
	if _, err := os.Stat(fileName); os.IsNotExist(err) {
		return false
	}
	return true
}

func prepareDB(db *sql.DB, schemesDir string) error {
	schemes, err := readSchemes(schemesDir)
	if err != nil {
		return err
	}

	for _, scheme := range schemes {
		stmt, err := db.Prepare(scheme)
		if err != nil {
			return err
		}

		_, err = stmt.Exec()
		if err != nil {
			return err
		}
		stmt.Close()
	}

	return nil
}

func readSchemes(schemesDir string) ([]string, error) {
	var schemes []string

	files, err := ioutil.ReadDir(schemesDir)
	if err != nil {
		return nil, err
	}

	for _, file := range files {
		fileName := filepath.Join(schemesDir, file.Name())
		data, err := ioutil.ReadFile(fileName)
		if err != nil {
			return nil, err
		}

		schemes = append(schemes, string(data))
	}
	return schemes, nil
}

func SessionChecker(existingSessionID string, userID int) (string, error) {
	err := db.QueryRow("SELECT session_id FROM sessions WHERE user_id = ?", userID).Scan(&existingSessionID)

	return existingSessionID, err
}

func DeleteSession(existingSessionID string) error {
	_, err := db.Exec("DELETE FROM sessions WHERE session_id = ?", existingSessionID)
	return err
}

func AddingSession(sessionID string, userID int, expiresAt time.Time) error {
	_, err := db.Exec("INSERT INTO sessions (user_id, session_id, expires_at) VALUES (?, ?, ?)", userID, sessionID, expiresAt)
	return err
}

func GetUserIDFromSession(cookie *http.Cookie, userID int, expiresAt time.Time) (int, time.Time, error) {
	err := db.QueryRow("SELECT user_id, expires_at FROM sessions WHERE session_id = ?", cookie.Value).Scan(&userID, &expiresAt)
	return userID, expiresAt, err
}

func GetUsernameFromUserID(userID int) (*User, error) {
	var user User
	err := db.QueryRow("SELECT id ,username , first_name , last_name , age , gender , email , password FROM users WHERE id = ?", userID).
		Scan(&user.ID,&user.Username, &user.FirstName, &user.LastName, &user.Age, &user.Gender, &user.Email, &user.Password)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

func CreateUser(user User) error {
	stmt, err := db.Prepare("INSERT INTO users (username , first_name,last_name , age,gender ,email , password) VALUES (?,?,?,?,?,?,?)")
	if err != nil {
		log.Printf("Failed to prepare statement: %v", err)
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	_,err = stmt.Exec(user.Username,user.FirstName,user.LastName,user.Age,user.Gender,user.Email,user.Password)
	if err != nil {
		if err.Error() == "constraint failed: UNIQUE constraint failed: users.username (2067)" {
			return ErrUserExists
		}else if err.Error() == "constraint failed: UNIQUE constraint failed: users.email (2067)"{
			return ErrUserExists
		}
		log.Printf("Failed to execute statement: %v", err)
		return fmt.Errorf("failed to execute statement: %w", err)
	}
	return nil
}

func GetUserByEmail(email string) (*User, error) {
	var user User
	err := db.QueryRow("SELECT id,password FROM users WHERE email = ?", email).
		Scan(&user.ID , &user.Password)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}
func GetUserByUsername(username string) (*User, error) {
	var user User
	err := db.QueryRow("SELECT id , password FROM users WHERE username = ?", username).
	Scan(&user.ID, &user.Password)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}


func GetAllCategories() ([]Category, error) {
	rows, err := db.Query("SELECT id , name FROM categories")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch categories: %w", err)
	}
	defer rows.Close()

	var categories []Category

	for rows.Next() {
		var category Category
		if err := rows.Scan(&category.ID, &category.Name); err != nil {
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, category)
	}
	return categories, nil
}


//Posts Section
func CreatePost(userID int , title string, content string, categories string) error {
	stmt , err := db.Prepare("INSERT INTO posts (user_id , title , content , author , category) VALUES (?,?,?,?,?)")
	if err != nil {
		return err
	}
	user, err := GetUsernameFromUserID(userID)
	if err != nil {
		return err
	}
	_ , err = stmt.Exec(userID, title,content,user.Username, categories)
	return err
}
func GetAllPosts() ([]Post, error) {
	var posts []Post
	rows , err := db.Query("SELECT id, user_id,title,content, author , category FROM posts")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		var categoriesStr string
		if err := rows.Scan(&post.ID,&post.UserID,&post.Title,&post.Content,&post.Author, &categoriesStr); err != nil {
			return nil,err
		}
		categoryNames := strings.Split(categoriesStr, ",")

		for _, name := range categoryNames {
			name = strings.TrimSpace(name)
			if name != "" {
				categoryID , err := GetCategoryIDByName(name) 
				if err != nil {
					return nil , err
				}
				post.Category = append(post.Category, Category{ID: categoryID, Name: name})}
		}
		posts = append(posts, post)
	}
	return posts , nil
}
func GetCategoryIDByName(name string) (int, error) {
	var id int
	err := db.QueryRow("SELECT id FROM categories WHERE name = ?", name).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("category '%s' not found", name)
		}
		return 0, fmt.Errorf("failed to retrieve category ID: %w", err)
	}
	return id, nil
}

func GetPostByID(postID int) (*Post,error) {
	var post Post
	err := db.QueryRow("SELECT id, user_id,title,content, author FROM posts WHERE id = ?", postID).
		Scan(&post.ID,&post.UserID,&post.Title,&post.Content,&post.Author)
	if err != nil {
		return nil , errors.New("post not found")
	}
	return &post, nil
}

//Comment Section
func CreateComment(userID int, postID, comment string) error {
	stmt, err := db.Prepare("INSERT INTO comments (user_id , post_id, content, author) VALUES(?,?,?,?)")
	if err != nil {
		return err
	}
	user, _ := GetUsernameFromUserID(userID)
	_, err = stmt.Exec( user.ID,postID, comment, user.Username)
	return err
}

func GetCommentsByPostID(postID int) ([]Comment, error) {
	var comments []Comment
	rows, err := db.Query("SELECT id, user_id, content , author , created_at FROM comments WHERE post_id = ?", postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment Comment
		var createdAt time.Time
		if err := rows.Scan(&comment.ID, &comment.User_ID, &comment.Content, &comment.Author, &createdAt); err != nil {
			return nil, err
		}
		comment.Created_at = createdAt.Format("2006-01-02 15:04:05")
		comments = append(comments, comment)
	}
	return comments, nil
}
func GetAllUsers() ([]User, error) {
	var users []User
	rows , err := db.Query("SELECT id, username FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID,&user.Username); err != nil {
			return nil,err
		}
		users = append(users, user)
	}
	return users , nil
}


//Messages Section

func GetMessagesWithPagination(senderID, receiverID, offset, limit int) ([]Message, error) {
    var messages []Message
    query := `
        SELECT id, sender_id, receiver_id, username, content, created_at, isRead 
        FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`

    rows, err := db.Query(query, senderID, receiverID, receiverID, senderID, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var message Message
        if err := rows.Scan(&message.ID, &message.Sender_ID, &message.Receiver_ID, 
            &message.Username, &message.Content, &message.Created_at, &message.IsRead); err != nil {
            return nil, err
        }
        messages = append(messages, message)
    }

    return messages, nil
}
func SaveMessage(senderID int , receiverID int , username string , content string, createdTime time.Time)  error {
	stmt , err := db.Prepare("INSERT INTO messages (sender_id , receiver_id , username , content,created_at ) VALUES(?,?,?,?,?)")
	if err != nil {
		return err
	}
	_, err = stmt.Exec(senderID,receiverID, username ,content,createdTime)
	return err
}

func GetMessages(sender_id int , recevier_id int) ([]Message , error) {
	var messages []Message
	rows , err := db.Query("SELECT id , sender_id , receiver_id , username , content , created_at , isRead FROM messages WHERE  (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)" , sender_id , recevier_id , recevier_id , sender_id)
	if err != nil {
		return nil , err
	}
	defer rows.Close()

	for rows.Next() {
		var message Message
		// var createdAt time.Time
		if err := rows.Scan(&message.ID , &message.Sender_ID, &message.Receiver_ID ,&message.Username ,&message.Content , &message.Created_at , &message.IsRead ); err != nil {
			return nil , err
		}
		// message.Created_at = createdAt.Format("2006-01-02 15:04:05")
		messages = append(messages, message)
	}
	return messages , nil
}

func MarkMessagesAsRead(senderID , receiverID int) error {
	_,err := db.Exec(`UPDATE messages SET isRead = 1 WHERE sender_id = ? AND receiver_id = ? AND isRead = 0`, senderID,receiverID)
	return err
}