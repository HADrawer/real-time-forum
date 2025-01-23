package main

import(
	"Real-Time/Go/DB"

)

func main(){
	database.ConnectDB("./Database/", "forum.db","./Database/schema/")
}

