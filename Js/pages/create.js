export function fetchAndRenderCreatePost() {
    // Dynamically load the CSS file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/create.css';
    document.head.appendChild(link);
    
    // Fetch categories data from the server
    fetch("/api/create-data")
        .then(response => response.json())
        .then(data => {
            renderCreatePost(data);
            setupFormValidation();
        })
        .catch(error => console.error("Error fetching create post data:", error));
}

function renderCreatePost(data) {
    const content = document.getElementById("content");
    if (!content) return;
    
    const categoriesHTML = data.Categories.map(category => 
        `<label class="check">
            <input type="checkbox" name="categories[]" value="${sanitizeHtml(category.Name)}">
            <span>${sanitizeHtml(category.Name)}</span>
        </label>`
    ).join("");
    
    content.innerHTML = `
        <div class="create-container">
            <form id="createPostForm" action="/Create" method="post">
                <div class="create-left">
                    <div class="create-left-title">
                        <h2>Create a New Post</h2>
                        <hr>
                    </div>
                    
                    <div class="input-group">
                        <input type="text" id="title" name="title" class="create-title" placeholder="Enter post title..." maxlength="100" required>
                        <div id="titleError" class="input-error"></div>
                    </div>
                    
                    <div class="input-group">
                        <textarea id="content" name="content" class="create-title" placeholder="Write your post content here..." maxlength="5000" required></textarea>
                        <div id="contentError" class="input-error"></div>
                    </div>
                    
                    <div class="create-right">
                        <h3>Choose Categories</h3>
                        <div class="categories">
                            ${categoriesHTML}
                        </div>
                        <div id="categoryError" class="input-error"></div>
                        
                        <button type="submit" class="post">Create Post</button>
                    </div>
                </div>
            </form>
        </div>
    `;
}

function setupFormValidation() {
    const form = document.getElementById('createPostForm');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const titleError = document.getElementById('titleError');
    const contentError = document.getElementById('contentError');
    const categoryError = document.getElementById('categoryError');
    
    if (!form || !titleInput || !contentInput) return;
    
    // Input validation events
    titleInput.addEventListener('input', function() {
        validateField(this, titleError, 'title');
    });
    
    contentInput.addEventListener('input', function() {
        validateField(this, contentError, 'content');
    });
    
    // Form submission validation
    form.addEventListener('submit', function(event) {
        let valid = true;
        
        // Validate title
        if (!validateField(titleInput, titleError, 'title')) {
            valid = false;
        }
        
        // Validate content
        if (!validateField(contentInput, contentError, 'content')) {
            valid = false;
        }
        
        // Validate categories (at least one must be selected)
        const categories = document.querySelectorAll('input[name="categories[]"]:checked');
        if (categories.length === 0) {
            categoryError.textContent = 'Please select at least one category.';
            categoryError.style.display = 'block';
            valid = false;
        } else {
            categoryError.style.display = 'none';
        }
        
        if (!valid) {
            event.preventDefault();
        }
    });
}

function validateField(field, errorElement, fieldType) {
    if (!field || !errorElement) return true;
    
    const value = field.value.trim();
    
    // Check if field is empty
    if (value === '') {
        const fieldName = fieldType.charAt(0).toUpperCase() + fieldType.slice(1);
        errorElement.textContent = `${fieldName} cannot be empty.`;
        errorElement.style.display = 'block';
        return false;
    }
    
    // Min length validation
    if (value.length < 3) {
        errorElement.textContent = `${fieldType === 'title' ? 'Title' : 'Content'} must be at least 3 characters long.`;
        errorElement.style.display = 'block';
        return false;
    }
    
    // Check for HTML tags
    if (/<[^>]*>/g.test(value)) {
        errorElement.textContent = 'HTML tags are not allowed.';
        errorElement.style.display = 'block';
        return false;
    }
    
    // If all validations pass
    errorElement.style.display = 'none';
    return true;
}

// Function to sanitize HTML and prevent XSS
function sanitizeHtml(text) {
    if (!text) return '';
    
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}