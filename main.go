package main

import (
	"Real-Time/Go/DB"
	"Real-Time/Go/handlers"
	"log"
	"net/http"
)

func main(){
	database.ConnectDB("./Database/", "forum.db","./Database/schema/")



	http.HandleFunc("/", handlers.HomeHandler )


	log.Print("Server is running on http://localhost:8080")


	http.Handle("/Js/", http.StripPrefix("/Js/",http.FileServer(http.Dir("Js"))))
	http.Handle("/Css/", http.StripPrefix("/Js/",http.FileServer(http.Dir("Css"))))

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Failed to start server: ", err)
	}


}
