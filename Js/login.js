export function fetchAndRenderLogin(){
    document.getElementById('content').innerHTML = ` 
            <div class="register-login">
                
                    <form action="/login" class="register-login-form" method="post" onsubmit="return validateRegisterForm()">
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
           
        
            togglePassword.addEventListener("click", () => {
                togglePasswordVisibility(passwordInput,togglePassword);
            });
            

            

            history.pushState({},"Login","/login")
}