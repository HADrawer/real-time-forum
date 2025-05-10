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
                            <input type="number" name="age" placeholder="Age" min="14" max="80" required>
                        </div>
                        <div class="form-field select-wrapper">
                            <select name="gender" required>
                                <option value="" disabled selected>Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
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
    const form = document.querySelector('.register-login-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                first_name: form.first_name.value,
                last_name: form.last_name.value,
                username: form.username.value,
                email: form.email.value,
                age: form.age.value,
                gender: form.gender.value,
                password: form.password.value,
                passwordConfirm: form.passwordConfirm.value
            };

            // Validate form
            const validation = validateRegistrationForm(formData);
            
            if (validation.isValid) {
                // Form is valid, submit it
                form.submit();
            } else {
                // Show errors
                displayFormErrors(validation.errors);
            }
        });
    }

    history.pushState({}, "Register", "/register");
}
// Validation functions
function validateNotEmpty(value, fieldName) {
    if (!value || value.trim() === '') {
        return `${fieldName} cannot be empty`;
    }
    return null;
}

function validateName(name, fieldName) {
    const emptyError = validateNotEmpty(name, fieldName);
    if (emptyError) return emptyError;

    if (!/^[a-zA-Z\-']+$/.test(name)) {
        return `${fieldName} contains invalid characters`;
    }

    if (name.length < 2 || name.length > 50) {
        return `${fieldName} must be between 2-50 characters`;
    }

    return null;
}

function validateUsername(username) {
    const emptyError = validateNotEmpty(username, "Username");
    if (emptyError) return emptyError;

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return "Username can only contain letters, numbers, and underscores";
    }

    if (username.length < 3 || username.length > 20) {
        return "Username must be between 3-20 characters";
    }

    return null;
}

function validateEmail(email) {
    const emptyError = validateNotEmpty(email, "Email");
    if (emptyError) return emptyError;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Please enter a valid email address";
    }

    return null;
}

function validateAge(age) {
    if (!age) return "Age is required";

    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return "Age must be a number";

    if (ageNum < 14 || ageNum > 80) {
        return "Age must be between 14-80";
    }

    return null;
}

function validateGender(gender) {
    if (!gender) return "Gender is required";
    if (gender !== "male" && gender !== "female") {
        return "Please select a valid gender";
    }
    return null;
}

function validatePassword(password) {
    const emptyError = validateNotEmpty(password, "Password");
    if (emptyError) return emptyError;

    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter";
    }

    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter";
    }

    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number";
    }

    return null;
}

function validatePasswordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
        return "Passwords do not match";
    }
    return null;
}

// Main validation function for the form
function validateRegistrationForm(formData) {
    const errors = {};

    // Validate each field
    errors.first_name = validateName(formData.first_name, "First name");
    errors.last_name = validateName(formData.last_name, "Last name");
    errors.username = validateUsername(formData.username);
    errors.email = validateEmail(formData.email);
    errors.age = validateAge(formData.age);
    errors.gender = validateGender(formData.gender);
    errors.password = validatePassword(formData.password);
    errors.passwordConfirm = validatePasswordMatch(
        formData.password, 
        formData.passwordConfirm
    );

    // Check if there are any errors
    const isValid = Object.values(errors).every(error => error === null);
    
    return {
        isValid,
        errors: isValid ? null : errors
    };
}

// Helper function to display errors
function displayFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    // Add new errors
    for (const [fieldName, errorMessage] of Object.entries(errors)) {
        if (errorMessage) {
            const input = document.querySelector(`[name="${fieldName}"]`);
            if (input) {
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = errorMessage;
                errorElement.style.color = 'red';
                errorElement.style.fontSize = '0.8rem';
                errorElement.style.marginTop = '0.25rem';
                
                // Insert after the input field
                input.insertAdjacentElement('afterend', errorElement);
            }
        }
    }
}