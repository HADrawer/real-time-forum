package handlers

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

var templates = template.Must(template.ParseGlob("Views/*.html"))

func RenderTemplate(w http.ResponseWriter) {
	tmpl := filepath.Join("Views", "index.html")
	if _, err := os.Stat(tmpl); os.IsNotExist(err) {
		if _, err404 := os.Stat(filepath.Join(tmpl)); os.IsNotExist(err404) {
			// 404.html is missing, directly return 404 error
			return
		}

	}
	
	err := templates.ExecuteTemplate(w, "index.html",nil)
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
	
	RenderTemplate(w)
}
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	_, isLoggedIn := GetUserIDFromSession(r)
	if isLoggedIn {
		http.Redirect(w,r,"/", http.StatusSeeOther)
	}
	
	if r.Method == http.MethodGet {

		RenderTemplate(w)
	}

	if r.Method == http.MethodPost {
		


	}
	
}
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	_, isLoggedIn := GetUserIDFromSession(r)
	if isLoggedIn {
		http.Redirect(w,r,"/", http.StatusSeeOther)
	}

	if r.Method == http.MethodGet {

		RenderTemplate(w)
	}

	if r.Method == http.MethodPost {
		


	}
}

func MessagesHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w)
}

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w)
}
