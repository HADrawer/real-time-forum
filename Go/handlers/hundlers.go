package handlers

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"golang.org/x/crypto/bcrypt"
	"Real-Time/Go/DB"

)

var templates = template.Must(template.ParseGlob("Views/*.html"))

func RenderTemplate(w http.ResponseWriter , data interface{}) {
	tmpl := filepath.Join("Views", "index.html")
	if _, err := os.Stat(tmpl); os.IsNotExist(err) {
		if _, err404 := os.Stat(filepath.Join(tmpl)); os.IsNotExist(err404) {
			// 404.html is missing, directly return 404 error
			return
		}

	}
	
	err := templates.ExecuteTemplate(w, "index.html",data)
	if err != nil {
		log.Print(err)
	}
}

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.Redirect(w,r,"/",  http.StatusFound)
		return
	}
	_, isLoggedIn := GetUserIDFromSession(r)
	if !isLoggedIn {
		http.Redirect(w,r,"/login", http.StatusSeeOther)
	}
	pageData := make(map[string]interface{})

	pageData["IsLoggedIn"] = isLoggedIn
		
	
	RenderTemplate(w, pageData)
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	_, isLoggedIn := GetUserIDFromSession(r)
	if isLoggedIn {
		http.Redirect(w,r,"/", http.StatusSeeOther)
	}
	
	if r.Method == http.MethodGet {
		pageData := make(map[string]interface{})

		pageData["IsLoggedIn"] = isLoggedIn
		RenderTemplate(w,pageData)
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

	hashedPassword ,err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing password:", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
	}
	newUser := database.User {
		Username: username,
		FirstName: first_name,
		LastName: last_name,
		Age: age,
		Gender: gender,
		Email: email,
		Password: string(hashedPassword),
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
		http.Redirect(w,r,"/", http.StatusSeeOther)
	}

	if r.Method == http.MethodGet {

		pageData := make(map[string]interface{})

		pageData["IsLoggedIn"] = isLoggedIn
		RenderTemplate(w,pageData)
	}

	if r.Method == http.MethodPost {
		


	}
}

func MessagesHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w,nil)
}

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w,nil)
}
