
export function fetchAndRenderRegister() {

    // Dynamically load the register.css file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/register.css';
    document.head.appendChild(link);


    document.getElementById('content').innerHTML = `
        <div class="register-login">
            <form action="/register" class="register-login-form" method="post">
                <p class="title">Register</p>
                <p class="message">Sign up here </p>
                <div class="form-group">
                    <label>
                        <input type="text" name="first_name" required>
                        <span>First name</span>
                    </label>
                    <label>
                        <input type="text" name="last_name" required>
                        <span>Last name</span>
                    </label>
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
        </div>`;
    history.pushState({}, "Register", "/register");
}