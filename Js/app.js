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

function fetchAndRenderPost(){
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (!postId) {
        console.error("Post ID not found.");
        return; 
    }
    
    fetch(`/api/post-data`)
    .then(response => response.json())
    .then(data => {
        const content = document.getElementById("content");
        if (content){

            // Filter the post by postId
            if (data.Posts && data.Posts.length > 0) {
                const post = data.Posts.find(post => parseInt(post.ID) === parseInt(postId)); 
            

            if (post) {
                content.innerHTML = `
                <div class="info-post">
                    <div class="comment-box">
                        <h1>${post.Title}</h1>

                        <h3>Content:</h3>
                        <p onclick="this.classList.toggle('expanded');">${post.Content}</p>

                        <p>Author: ${post.Author}</p>
                    </div>

                    <h2>Add a Comment</h2>
                    <form action="/Comment" method="post" onsubmit="return validateForm()">
                        <input name="PostID" value="${post.id}" type="hidden">
                        <textarea name="PostComment" id="Comment" placeholder="Write Your Comment here" maxlength="250" required></textarea><br>
                        <div id="CommentError" style="color:red; display:none;"></div>

                        <input type="submit" class="button-primary" value="Add Comment">
                    </form>

                    <hr class="divider">

                    <h2>Comments</h2>
                    <ul>
                      
                        }
                    </ul>
                </div>
                `;
            } else {
                content.innerHTML = `<p>Post not found.</p>`;  // Handle if the post ID doesn't match any post
            }
        } else {
            content.innerHTML = `<p>No posts available.</p>`;

            
        }
        }
    })
    .catch(error => console.error("Error fetching post page data:", error));
    
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