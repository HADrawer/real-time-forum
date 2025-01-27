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

    }else if (path === "/register"){
        fetchAndRenderRegister()
    }else if (path === "/login"){
        fetchAndRenderLogin()
    }else if (path === "/Direct"){

    }else if (path === "/Create"){

    }else {
        renderNotFoundPage();
    }

}

function fetchAndRenderHomePage(){

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
    
}
function fetchAndRenderCreate(){
    
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