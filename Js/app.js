document.addEventListener("DOMContentLoaded", function(){
    handleNavigation();


    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (event){
            event.preventDefault();

            const path = this.getAttribute('href');
            history.pushState({},"",path);
            handleNavigation();
        });
    });
    
    window.addEventListener('popstate',handleNavigation);
});


function handleNavigation() {
    let path = window.location.pathname;

    if (path === "/") {
        fetchAndRenderHomePage()
    }else if (path === "/register"){
        fetchAndRenderRegister()
    }else if (path === "/login"){
        fetchAndRenderLogin()
    }else if (path === "/Create"){
        fetchAndRenderCreate()
    }else if(path === "/Direct"){
        fetchAndRenderDirect()
    }else if (path.startsWith("/Post")){
        fetchAndRenderPost()
    }

}

function fetchAndRenderHomePage(){
    fetch("/api/home-data")
        .then(response => response.json())
        .then(data =>{
            const content = document.getElementById("content");
            if (content){

                content.innerHTML = ` 
                 <div class="content-wrapper">
                            <div class="posts">
                            ${data.Posts.length > 0 ? data.Posts.map(post =>
                                `
                                <div class="content">
                                    <div class="infoStupid">
                                        <a href="/Post?id=${post.ID}"><h3>${post.Title}</h3></a>
                                        <p>Posted By ${post.Author}</p>
                                    </div>
                                </div>
                            `).join("") : `
                                <div class="content">
                                    <div class="info">
                                        <h1>No posts found.</h1>
                                    </div>
                                </div>
                                `}      
                            </div>
                        </div>
                `;
            }
        })
        .catch(error => console.error("Error fetching home page data:", error));
        
    }


function fetchAndRenderRegister(){
    document.getElementById('content').innerHTML = ` 
            <div class="register-login">
                
                    <form action="/register" class="register-login-form" method="post">
                    <p class="title">Register</p>
                    <p class="message">Sign up here </p>
                    <div class="form-group">
                        <label>
                            <input type="text" name="first_name"  required>
                            <span>First name</span>
                        </label>
                        <label>
                            <input type="text" name="last_name" required>
                            <span>Last name</span>
                        </label>
                    </div>
                    <label>
                        <input type="text" name="username"  required>
                        <span>username</span>
                    </label>
                    <label>
                        <input type="email" name="email"  required>
                        <span>Email</span>
                    </label>
                    <label>
                        <input type="text" name="age"  required>
                        <span>Age</span>
                    </label>
                    <label>
                        <input type="text" name="gender"  required>
                        <span>Gender</span>
                    </label>
                    <label>
                        <input type="password" id="password" name="password"  required>
                        <span>Password</span>
                        <span class="icon" id="togglePassword"><i class="far fa-eye-slash" ></i></span>
                    </label>
                    <label>
                        <input type="password" id="passwordConfirm" >
                        <span>Confirm password</span>
                        <span class="icon" id="togglePasswordConfirm"><i class="far fa-eye-slash" ></i></span>
                    </label>
                <button class="submitregister-login">Submit</button>
                <p class="signin">
                    Already have an account? <a href="/login">Signin </a>
                </p>
                </form>
              
            </div>`;
            history.pushState({},"Register","/register")
}
function fetchAndRenderLogin(){
    document.getElementById('content').innerHTML = ` 
            <div class="register-login">
                
                    <form action="/login" class="register-login-form" method="post">
                    <p class="title">Login</p>
                    <p class="message">login here </p>
                    
                    <label>
                        <input type="text" name="email"  required>
                        <span>username or email</span>
                    </label>
                    
                    
                    <label>
                        <input type="password" id="password" name="password"  required>
                        <span>Password</span>
                        <span class="icon" id="togglePassword"><i class="far fa-eye-slash" ></i></span>
                    </label>
                   
                <button class="submitregister-login">Submit</button>
                <span style="color:red; ">{{.InvalidLogin}}</span>
                <p class="signin">
                     don't have an account? <a href="/register">Register </a>
                </p>
                </form>
              
            </div>`;
            history.pushState({},"Login","/login")
}
function fetchAndRenderDirect(){
    
    document.getElementById('content').innerHTML = ` 
        <div class="sidebar">
                    <h2>Users</h2>
                    <ul class="user-list" id="userList">
                    </ul>
                </div>
                            
                <div class="chat-area" id="ChatArea">
                    <div class="chat-header">
                        Chat with <span id="chatWith"> </span>
                    </div>

                    <div class="chat-messages" id="messages">
                        <!-- Messages will appear here -->
                        
                    </div>
                    <div class="chat-input-container">
                        <input type="text" class="chat-input" id="messageInput" placeholder="Type a message..." />
                        <button class="chat-send" id="sendMessage">Send</button>
                    </div>
                </div>  
    `;

    const socket = new WebSocket(`ws://${window.location.hostname}:8080/ws`);
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const userList = document.getElementById('userList');
    const chatWith = document.getElementById('chatWith');
    const chatVisible = document.getElementById('ChatArea');
    chatVisible.classList.add('hidden');
    fetch(`http://${window.location.hostname}:8080/users`)
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                
                const userItem = document.createElement('li');
                userItem.textContent = user.Username;
                userItem.onclick = () => {
                    chatWith.textContent = user.Username;
                    chatVisible.classList.remove('hidden');
                };
                userList.appendChild(userItem);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
                    
        socket.onopen = () => {
        const username = "You"; // This should be dynamically set based on the logged-in user
         socket.send(JSON.stringify({ username: username }));
        };      

                        //             socket.onopen = () => {
                        // console.log('Connected to WebSocket');
                        // // Send username once connected
                        // const username = prompt('Enter your username:');
                        // socket.send(JSON.stringify(username)); // Send username to server
                        //             };

        socket.onmessage = (event) => {
                const msg =JSON.parse(event.data);
                const messageDiv = document.createElement('div');
                messageDiv.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
                messagesContainer.appendChild(messageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };
                    
        sendMessageButton.addEventListener('click', () => {
            const message = messageInput.value;
            if (message) {
                const msg = {
                    username: 'You',
                    message: message
                };
                socket.send(JSON.stringify(msg));
                messageInput.value = '';
            }
        });

        messageInput.addEventListener('keypress', (e)=> {
            if (e.key === 'Enter') {
                sendMessageButton.click();
            }
        });

    history.pushState({},"direct","/Direct")
}

function fetchAndRenderCreate(){
    fetch("/api/create-data")
        .then(response => response.json())
        .then(data => {
            const content = document.getElementById("content");
        if (content){

            content.innerHTML = `
             <div class="create-container">
                <form action="/Create" method="post">
                <div class="create-left">
                    <div class="create-left-title">
                        <h2>Create Post</h2>
                        <hr>
                    </div>
                    <input type="text" name="title" placeholder="Title" class="create-title" required>
                    <textarea type="text" name="content" placeholder="Write what you think about" class="create-title" required></textarea>
                    <div class="create-right">
                        <div class="categories">
                                        ${data.Categories.map(category => 
                                            `<label class="check"><input type="checkbox" name="categories[]" value="${category.Name}"><span>${category.Name}</span></label>`
                                        ).join("")}
                                       <div id="categoryError" style="color:red; display:none; margin-top: 8px;"></div>
                                 </div>
                        
                        <button type="submit" class="post">Submit</button>
        
                        </div>
                </div>
                </form>
            </div>`;
        }
        })

}

async function fetchAndRenderPost(){
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (!postId) {
        console.error("Post ID not found.");
        return; 
    }
    const postIdInt = parseInt(postId, 10);  // The second parameter (10) indicates base-10

    if (isNaN(postIdInt)) {
        console.error("Post ID is not a valid integer.");
        return;
    }

    const data = {
        id: postIdInt,
    };
      
      // Sending JSON data via POST request
     const response = await fetch('/api/post-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)  // Convert JavaScript object to JSON string
      })

      if (response.ok){
        const data = await response.json();
      

        const content = document.getElementById("content");
        if (content){

            // Filter the post by postId
            if (data.Post) {
               
                content.innerHTML = `
                <div class="info-post">
                    <div class="comment-box">
                        <h1>${data.Post.Title}</h1>

                        <h3>Content:</h3>
                        <p onclick="this.classList.toggle('expanded');">${data.Post.Content}</p>

                        <p>Author: ${data.Post.Author}</p>
                    </div>

                    <h2>Add a Comment</h2>
                    <form action="/Comment" method="post" onsubmit="return validateForm()">
                        <input name="PostID" value="${data.Post.ID}" type="hidden">
                        <textarea name="PostComment" id="Comment" placeholder="Write Your Comment here" maxlength="250" required></textarea><br>
                        <div id="CommentError" style="color:red; display:none;"></div>

                        <input type="submit" class="button-primary" value="Add Comment">
                    </form>

                    <hr class="divider">

                    <h2>Comments</h2>
                    <ul>
                       ${data.Comments &&  data.Comments.length > 0 ? data.Comments.map(comment => 
                        `
                            <div class="Post-box">
                                <h3>${comment.Author}</h3>
                                <div class="comment-content" onclick="this.classList.toggle('expanded');">
                                    <p class="comment-text">${comment.Content}</p>
                                </div>
                                <h6>${comment.Created_at}</h6>
                            </div>
                        `).join("") :
                        `
                        <p>No comments yet.</p>
                        `
                        }
                    </ul>
                </div>
                `;
            } else {
                content.innerHTML = `<p>Post not found.</p>`;  // Handle if the post ID doesn't match any post
            }
        
        }
      }else{
        console.log("kkkk")
      }
}


function renderNotFoundPage(){
    
}
document.addEventListener("DOMContentLoaded", function () {
    const togglePasswordVisibility = (inputElement,ToggleElemet) => {
        if(inputElement.type === "password") {
            inputElement.type = "text";
            toggleElemet.innerHTML = `<i class="far fa-eye"></i>`;
        }else {
             inputElement.type = "password";
            toggleElemet.innerHTML = `<i class="far fa-eye-slash"></i>`;
        }
    }
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const passwordConfirm = document.getElementById("passwordConfirm");
    const togglePasswordConfirm = document.getElementById("togglePasswordConfirm");

    togglePassword.addEventListener("click", () => {
        togglePasswordVisibility(passwordInput,togglePassword);
    });
    togglePasswordConfirm.addEventListener("click",() => {
        togglePasswordVisibility(passwordConfirm,togglePasswordConfirm)
    });
});