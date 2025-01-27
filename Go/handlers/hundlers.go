package handlers

import (
	database "Real-Time/Go/DB"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

var templates = template.Must(template.ParseGlob("Views/*.html"))

func RenderTemplate(w http.ResponseWriter, data interface{}) {
	tmpl := filepath.Join("Views", "index.html")
	if _, err := os.Stat(tmpl); os.IsNotExist(err) {
		if _, err404 := os.Stat(filepath.Join(tmpl)); os.IsNotExist(err404) {
			// 404.html is missing, directly return 404 error
			return
		}

	}

	err := templates.ExecuteTemplate(w, "index.html", data)
	if err != nil {
		log.Print(err)
	}
}

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	_, isLoggedIn := GetUserIDFromSession(r)
	if !isLoggedIn {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
	}
	pageData := make(map[string]interface{})

	pageData["IsLoggedIn"] = isLoggedIn

	RenderTemplate(w, pageData)
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	_, isLoggedIn := GetUserIDFromSession(r)
	if isLoggedIn {
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}

	if r.Method == http.MethodGet {
		pageData := make(map[string]interface{})

		pageData["IsLoggedIn"] = isLoggedIn
		RenderTemplate(w, pageData)
	}

	if r.Method == http.MethodPost {
		pageData := make(map[string]interface{})

		pageData["IsLoggedIn"] = isLoggedIn

		username := r.FormValue("username")
		first_name := r.FormValue("first_name")
		last_name := r.FormValue("last_name")
		age := r.FormValue("age")
		gender := r.FormValue("gender")
		email := r.FormValue("email")
		password := r.FormValue("password")

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Println("Error hashing password:", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		newUser := database.User{
			Username:  username,
			FirstName: first_name,
			LastName:  last_name,
			Age:       age,
			Gender:    gender,
			Email:     email,
			Password:  string(hashedPassword),
		}
		err = database.CreateUser(newUser)
		if err != nil {
			if err == database.ErrUserExists {

				RenderTemplate(w, pageData)
				return
			} else {
				log.Println("Error creating user:", err)
				http.Error(w, "Internal server error", http.StatusInternalServerError)
			}
			return
		}

		user, err := database.GetUserByEmail(email)
		if err != nil {
			http.Error(w, "Invalid login", http.StatusUnauthorized)
			return
		}
		CreateSession(w, user.ID)
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}

}
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	_, isLoggedIn := GetUserIDFromSession(r)
	if isLoggedIn {
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}

	if r.Method == http.MethodGet {

		pageData := make(map[string]interface{})

		pageData["IsLoggedIn"] = isLoggedIn
		RenderTemplate(w, pageData)
	}

	if r.Method == http.MethodPost {
		Email_UserName := r.FormValue("email")
		password := r.FormValue("password")
		user, err := database.GetUserByEmail(Email_UserName)
		if err != nil {
			user, err = database.GetUserByUsername(Email_UserName)
		}

		if err != nil || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
			pageData := map[string]interface{}{
				"InvalidLogin": "The Username or Password is Uncorrect",
			}
			RenderTemplate(w, pageData)
			return
		}
		CreateSession(w, user.ID)
		http.Redirect(w, r, "/", http.StatusSeeOther)

	}
}

func MessagesHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w, nil)
}

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	userID, isLoggedIn := GetUserIDFromSession(r)
	if !isLoggedIn {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		fmt.Fprintf(w, "ParseForm() err: %v", err)
		return
	}
	if r.Method == http.MethodGet {
		Categories, _ := database.GetAllCategories()
		pageData := make(map[string]interface{})
		var postDetails []map[string]interface{}
		for _, Category := range Categories {
			postDetail := map[string]interface{}{
				"Category": Category.Name,
			}
			postDetails = append(postDetails, postDetail)
		}
		pageData["IsLoggedIn"] = isLoggedIn
		pageData["Categories"] = postDetails
		
		RenderTemplate(w, pageData)
		return
	}
	if r.Method == http.MethodPost {
		title := r.FormValue("title")
		content := r.FormValue("content")
		categories := r.Form["categories[]"]
		stringCategories := strings.Join(categories, ",")
		if title == "" || content == "" || len(categories) == 0 {

			http.Error(w, "Bad request: Missing PostID or Comment", http.StatusBadRequest)

		}

		err := database.CreatePost(userID, title, content, stringCategories)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError) // 500
			return
		}

		http.Redirect(w, r, "/", http.StatusSeeOther)
	}
}
func CreateDataHandler(w http.ResponseWriter , r *http.Request) {
	categories, err := database.GetAllCategories()
    if err != nil {
        http.Error(w, "Unable to load categories", http.StatusInternalServerError)
        return
    }
	responseData := map[string]interface{}{
		"Categories" : categories,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responseData)
}
