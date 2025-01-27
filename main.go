package main

import (
	"Real-Time/Go/DB"
	"Real-Time/Go/handlers"
	"log"
	"net/http"
	
)

func main(){
	database.Init()



	http.HandleFunc("/", handlers.HomeHandler )
	http.HandleFunc("/login", handlers.LoginHandler )
	http.HandleFunc("/register", handlers.RegisterHandler )
	http.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		handlers.DestroySession(w,r)
		http.Redirect(w,r,"/login",http.StatusSeeOther)
	})
	http.HandleFunc("/Direct", handlers.MessagesHandler)
	http.HandleFunc("/Create", handlers.CreatePostHandler)
	http.HandleFunc("/api/create-data", handlers.CreateDataHandler)
	



	log.Print("Server is running on http://localhost:8080")


	http.Handle("/Css/", http.StripPrefix("/Css/",http.FileServer(http.Dir("Css"))))
	http.Handle("/Js/", http.StripPrefix("/Js/",http.FileServer(http.Dir("Js"))))

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Failed to start server: ", err)
	}


}