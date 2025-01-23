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
	RenderTemplate(w)
}
