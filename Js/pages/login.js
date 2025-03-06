
export function fetchAndRenderLogin() {
    // Dynamically load the login.css file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/login.css';
    document.head.appendChild(link);

    // Render the login form
    const content = document.getElementById('content');
    if (content) {
        content.innerHTML = `
            <div class="login-container">
                <div class="login-form">
                    <form action="/login" class="register-login-form" method="post">
                        <p class="title">Login</p>
                        <p class="message">Enter your email and password to login</p>
                        <label>
                            <input type="email" name="email" placeholder="Enter your email" required>
                        </label>
                        <label>
                            <input type="password" name="password" placeholder="Enter your password" required>
                            <span class="icon" id="togglePassword"><i class="far fa-eye-slash"></i></span>
                        </label>
                        
                        <button type="submit" class="submit-btn">Login</button>
                          <p class="signin">
                    don't have an account? <a href="/register">Register </a>
                </p>
                    </form>
                </div>
                <div class="image-section">
                    <h2>Every new friend is a new adventure.</h2>
                    <p>Let's get connected</p>
                </div>
            </div>`;
    } else {
        console.error("Content element not found!");
    }

    history.pushState({}, "Login", "/login");
}