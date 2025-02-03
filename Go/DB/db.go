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
	"time"
	_ "github.com/mattn/go-sqlite3"
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
	Created_at string
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

	db, err = sql.Open("sqlite3", dataSourceName)
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
	rows , err := db.Query("SELECT id, user_id,title,content, author,category FROM posts")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		if err := rows.Scan(&post.ID,&post.UserID,&post.Title,&post.Content,&post.Author,&post.Category); err != nil {
			return nil,err
		}
		posts = append(posts, post)
	}
	return posts , nil
}
func GetPostByID(postID int) (*Post,error) {
	var post Post
	err := db.QueryRow("SELECT id, user_id,title,content, author,category FROM posts").
		Scan(&post.ID,&post.UserID,&post.Title,&post.Content,&post.Author,&post.Category)
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