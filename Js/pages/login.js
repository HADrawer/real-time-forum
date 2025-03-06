
export function fetchAndRenderLogin() {
    // Dynamically load the login.css file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/login.css';
    document.head.appendChild(link);

    document.getElementById('content').innerHTML = `
        <div class="register-login">
            <form action="/login" class="register-login-form" method="post">
                <p class="title">Login</p>
                <p class="message">login here </p>
                <label>
                    <input type="text" name="email" required>
                    <span>username or email</span>
                </label>
                <label>
                    <input type="password" id="password" name="password" required>
                    <span>Password</span>
                    <span class="icon" id="togglePassword"><i class="far fa-eye-slash"></i></span>
                </label>
                <button class="submitregister-login">Submit</button>
                <span style="color:red; ">{{.InvalidLogin}}</span>
                <p class="signin">
                    don't have an account? <a href="/register">Register </a>
                </p>
            </form>
        </div>`;
    history.pushState({}, "Login", "/login");
}