export function fetchAndRenderRegister(){
    document.getElementById('content').innerHTML = ` 
            <div class="register-login">
                
                    <form action="/register" class="register-login-form" method="post" onsubmit="return validateRegisterForm()">
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
            const togglePasswordVisibility = (inputElement,ToggleElemet) => {
                if(inputElement.type === "password") {
                    inputElement.type = "text";
                    ToggleElemet.innerHTML = `<i class="far fa-eye"></i>`;
                }else {
                     inputElement.type = "password";
                    ToggleElemet.innerHTML = `<i class="far fa-eye-slash"></i>`;
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

            history.pushState({},"Register","/register")
}

function validateRegisterForm(){
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("passwordConfirm").value
    
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false;
    }
    return true
}
