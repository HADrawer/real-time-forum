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
	err := db.QueryRow(" username , first_name , last_name , age , gender , email , password FROM users WHERE id = ?", userID).
		Scan(&user.Username, &user.FirstName, &user.LastName, &user.Age, &user.Gender, &user.Email, &user.Password)
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
	err := db.QueryRow("SELECT id FROM users WHERE email = ?", email).
		Scan(&user.ID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}