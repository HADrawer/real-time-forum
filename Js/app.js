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
    }else if (path === "/Direct"){
        fetchAndRenderDirect()
    }else if (path === "/Create"){
        fetchAndRenderCreate()
    }else if (path.startsWith("/Post")){
        fetchAndRenderPost()
    }else {
        renderNotFoundPage();
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
           <div class="container">
        <div class="register-section">
            <form class="register-form" action="/register" method="post">
                <h1 class="title">Register</h1>
                <p class="message">Sign up here</p>
                
                <div class="form-group">
                    <div class="form-field">
                        <input type="text" name="first_name" required>
                        <label>First name</label>
                    </div>
                    <div class="form-field">
                        <input type="text" name="last_name" required>
                        <label>Last name</label>
                    </div>
                </div>
                
                <div class="form-field">
                    <input type="text" name="username" required>
                    <label>Username</label>
                </div>
                
                <div class="form-field">
                    <input type="email" name="email" required>
                    <label>Email</label>
                </div>
                
                <div class="form-field">
                    <input type="text" name="age" required>
                    <label>Age</label>
                </div>
                
                <div class="form-field">
                    <input type="text" name="gender" required>
                    <label>Gender</label>
                </div>
                
                <div class="form-field">
                    <input type="password" name="password" id="password" required>
                    <label>Password</label>
                    <span class="password-toggle" id="togglePassword"></span>
                </div>
                
                <div class="form-field">
                    <input type="password" id="passwordConfirm" required>
                    <label>Confirm password</label>
                    <span class="password-toggle" id="togglePasswordConfirm"></span>
                </div>
                
                <button type="submit" class="submit-btn">Submit</button>
                
                <p class="signin">
                    Already have an account? <a href="/login">Sign in</a>
                </p>
            </form>
        </div>
        
        <div class="image-section">
            <div>
                <h2>Every new friend is a new adventure.</h2>
                <p>Let's get connected</p>
            </div>
        </div>
    </div>`;
            history.pushState({},"Register","/register")
}
function fetchAndRenderLogin(){
    document.getElementById('content').innerHTML = ` 
           <div class="container">
        <div class="login-section">
            <form class="login-form">
                <h1 class="title">Login</h1>
                <p class="message">Login here</p>
                
                <div class="form-group">
                    <input type="email" required>
                    <label>Email</label>
                </div>
                
                <div class="form-group">
                    <input type="password" required>
                    <label>Password</label>
                    <span class="password-toggle">👁️</span>
                </div>
                
                <div class="forgot-password">
                    <a href="#">Forgot password?</a>
                </div>
                
                <button type="submit" class="submit-btn">Login</button>
                
                <p class="signup-link">
                    Don't have an account? <a href="/register"">Sign up now</a>
                </p>
            </form>
        </div>
        
        <div class="image-section">
            <div>
                <h2>Every new friend is a new adventure.</h2>
                <p>Let's get connected</p>
            </div>
        </div>
    </div>`;
            history.pushState({},"Login","/login")
}
function fetchAndRenderDirect(){
    document.getElementById('content').innerHTML = ` 
    `;
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