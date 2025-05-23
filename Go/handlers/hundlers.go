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
	// "strconv"
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
    // Check if the user is logged in
    _, isLoggedIn := GetUserIDFromSession(r)
    if !isLoggedIn {
        http.Redirect(w, r, "/login", http.StatusSeeOther)
        return
    }

    // Prepare page data
    pageData := make(map[string]interface{})
    pageData["IsLoggedIn"] = isLoggedIn

    // Fetch all posts
    posts, err := database.GetAllPosts()
    if err != nil {
        http.Error(w, "Unable to load posts", http.StatusInternalServerError)
        return
    }

    // Filter posts by category if a category is specified
    category := r.URL.Query().Get("category")
    if category != "" {
        posts = filterPostsByCategory(posts, category)
    }

    // Check if posts exist
    isExist := true
    if posts == nil {
        isExist = false
    }

    // Prepare post details
    var postDetails []map[string]interface{}
    for _, post := range posts {
        postDetail := map[string]interface{}{
            "Id":       post.ID,
            "Author":   post.Author,
            "Title":    post.Title,
            "Category": post.Category, // Include the category in the post details
        }
        postDetails = append(postDetails, postDetail)
    }

    // Fetch all categories
    categories, err := database.GetAllCategories()
    if err != nil {
        http.Error(w, "Unable to load categories", http.StatusInternalServerError)
        return
    }

    // Add data to the pageData map
    pageData["isExist"] = isExist
    pageData["Posts"] = postDetails
    pageData["Categories"] = categories // Add categories to the page data

    // Render the template with the page data
    RenderTemplate(w, pageData)
}

// Helper function to filter posts by category
func filterPostsByCategory(posts []database.Post, category string) []database.Post {
    var filteredPosts []database.Post
    for _, post := range posts {
        for _, cat := range post.Category {
            if cat.Name == category {
                filteredPosts = append(filteredPosts, post)
                break
            }
        }
    }
    return filteredPosts
}
func HomeDataHandler(w http.ResponseWriter, r *http.Request) {

	posts, err := database.GetAllPosts()
	if err != nil {
		http.Error(w, "Unable to load posts", http.StatusInternalServerError)
		return
	}
	categories , err := database.GetAllCategories()
	if err != nil {
		http.Error(w,"Unable to load Categories", http.StatusInternalServerError)
		return
	}
	responseData := map[string]interface{}{
		"Posts": posts,
		"Categories": categories,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responseData)

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
 // Check if the user exists and the password is correct
 if err != nil || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
	pageData := map[string]interface{}{
		"IsLoggedIn":    false,
		"InvalidLogin":  "The Username or Password is incorrect", // Error message
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
		pageData := make(map[string]interface{})
		
		pageData["IsLoggedIn"] = isLoggedIn

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
			return
		}

		err := database.CreatePost(userID, title, content, stringCategories)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError) // 500
			return
		}

		http.Redirect(w, r, "/", http.StatusSeeOther)
	}
}
func CreateDataHandler(w http.ResponseWriter, r *http.Request) {
	categories, err := database.GetAllCategories()
	if err != nil {
		http.Error(w, "Unable to load categories", http.StatusInternalServerError)
		return
	}
	responseData := map[string]interface{}{
		"Categories": categories,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responseData)
}

func ViewPostHandler(w http.ResponseWriter, r *http.Request) {
	_, isLoggedIn := GetUserIDFromSession(r)
	isExist := true
	if !isLoggedIn {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		fmt.Fprintf(w, "ParseForm() err: %v", err)
		return
	}

	// Prepare page data with post details and comments
	pageData := make(map[string]interface{})
	
	pageData["IsLoggedIn"] = isLoggedIn
	pageData["isExist"] = isExist
	

	// Render the view post template
	RenderTemplate(w,  pageData)

}

type PostID struct {
	ID  int `json:"id"`
}

func  PostDataHandler(w http.ResponseWriter, r *http.Request ) {
	
	w.Header().Set("Content-Type", "application/json")

	

	// Declare a variable to store the decoded data
	var id PostID

	// Decode the incoming JSON data into the struct
	err := json.NewDecoder(r.Body).Decode(&id)
	if err != nil {
		http.Error(w, "Error decoding JSON", http.StatusBadRequest)
		return
	}

	// Print the decoded data
	fmt.Printf("Received Data: %+v\n", id)

	post, err := database.GetPostByID(id.ID)
	if err != nil {
		http.Error(w, "Unable to load posts", http.StatusInternalServerError)
		return
	}
	comments,err := database.GetCommentsByPostID(id.ID)
	if err != nil {
		fmt.Print(err.Error())
		// http.Error(w, "Unable to load Comments", http.StatusInternalServerError)
		return
	}
	responseData := map[string]interface{}{
		"Post": post,
		"Comments":comments,
	}
	json.NewEncoder(w).Encode(responseData)


}





func CommentHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := GetUserIDFromSession(r)

	// Extract form values
	postId := r.FormValue("PostID")
	comment := r.FormValue("PostComment")

	// Check if required fields are present
	if postId == "" || comment == "" {
		http.Error(w, "Bad request: Missing PostID or Comment", http.StatusBadRequest) // 400
		return
	}

	// Attempt to create comment
	err := database.CreateComment(userID, postId, comment)
	if err != nil {
		http.Error(w, "Internal server error 500", http.StatusInternalServerError) // 500
		RenderTemplate(w, nil)  
		return
	}

	// Redirect to the post page after successful comment creation
	http.Redirect(w, r, "/Post?id="+postId, http.StatusFound)
}


func DirectHandler(w http.ResponseWriter, r *http.Request) {
	_, isLoggedIn := GetUserIDFromSession(r)
	if !isLoggedIn {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
	}
	pageData := make(map[string]interface{})

	pageData["IsLoggedIn"] = isLoggedIn

	users, err := database.GetAllUsers()
	if err != nil {
		http.Error(w, "Unable to load posts", http.StatusInternalServerError)
		// RenderTemplate(w, "500", nil)   // 500
		return
	}
	isExist := true
	if users == nil {
		isExist = false
	}
	var usersDetails []map[string]interface{}
	for _, user := range users {
		postDetail := map[string]interface{}{
			"Id":     user.ID,
			"Username": user.Username,

		}
		usersDetails = append(usersDetails, postDetail)
	}
	pageData["isExist"] = isExist
	pageData["Users"] = usersDetails

	RenderTemplate(w, pageData)
}

