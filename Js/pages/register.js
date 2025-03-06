export function fetchAndRenderRegister() {
    // Dynamically load the register.css file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/register.css';
    document.head.appendChild(link);

    // Render the registration form
    const content = document.getElementById('content');
    if (content) {
        content.innerHTML = `
            <div class="register-container">
                <div class="register-form">
                    <form action="/register" class="register-login-form" method="post">
                        <p class="title">Register</p>
                        <p class="message">Sign up here</p>
                        <div class="form-group">
                            <label>
                                <input type="text" name="first_name" placeholder="First name" required>
                            </label>
                            <label>
                                <input type="text" name="last_name" placeholder="Last name" required>
                            </label>
                        </div>
                        <div class="form-field">
                            <input type="text" name="username" placeholder="Username" required>
                        </div>
                        <div class="form-field">
                            <input type="email" name="email" placeholder="Email" required>
                        </div>
                        <div class="form-field">
                            <input type="text" name="age" placeholder="Age" required>
                        </div>
                        <div class="form-field">
                            <input type="text" name="gender" placeholder="Gender" required>
                        </div>
                        <div class="form-field">
                            <input type="password" name="password" id="password" placeholder="Password" required>
                            <span class="password-toggle" id="togglePassword"><i class="far fa-eye-slash"></i></span>
                        </div>
                        <div class="form-field">
                            <input type="password" id="passwordConfirm" placeholder="Confirm password" required>
                            <span class="password-toggle" id="togglePasswordConfirm"><i class="far fa-eye-slash"></i></span>
                        </div>
                        <button type="submit" class="submit-btn">Register</button>
                        <p class="signin">
                            Already have an account? <a href="/login">Sign in</a>
                        </p>
                    </form>
                </div>
                <div class="image-section">
                    <h2>Every new friend is a new adventure.</h2>
                    <p>Let's get connected!</p>
                </div>
            </div>`;
    } else {
        console.error("Content element not found!");
    }

    history.pushState({}, "Register", "/register");
}