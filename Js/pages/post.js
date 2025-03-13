export async function fetchAndRenderPost() {
    // Dynamically load the post.css file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/post.css';
    document.head.appendChild(link);
    
    // Extract post ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        console.error("Post ID not found.");
        return;
    }
    
    const postIdInt = parseInt(postId, 10);
    
    if (isNaN(postIdInt)) {
        console.error("Post ID is not a valid integer.");
        return;
    }
    
    const data = { id: postIdInt };
    
    try {
        const response = await fetch('/api/post-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const responseData = await response.json();
        const content = document.getElementById("content");
        
        if (content && responseData.Post) {
            // Sanitize content from potential HTML
            const sanitizedTitle = sanitizeHtml(responseData.Post.Title);
            const sanitizedContent = sanitizeHtml(responseData.Post.Content);
            const sanitizedAuthor = sanitizeHtml(responseData.Post.Author);
            
            content.innerHTML = `
                <div class="info-post">
                    <div class="comment-box">
                        <h1>${sanitizedTitle}</h1>
                        <h3>Content:</h3>
                        <div class="post-content">
                            <p>${sanitizedContent}</p>
                        </div>
                        <div class="author-info">
                            <p>Posted by <span class="author-name">${sanitizedAuthor}</span></p>
                        </div>
                    </div>
                    
                    <div class="comment-section">
                        <h2>Add a Comment</h2>
                        <form class="comment-form" action="/Comment" method="post" onsubmit="return validateCommentForm()">
                            <input name="PostID" value="${responseData.Post.ID}" type="hidden">
                            <textarea 
                                name="PostComment" 
                                id="Comment" 
                                placeholder="Write your comment here..." 
                                maxlength="250" 
                                required
                            ></textarea>
                            <div id="CommentError"></div>
                            <button type="submit" class="button-primary post">Add Comment</button>
                        </form>
                    
                        <hr class="divider">
                        
                        <h2>Comments</h2>
                        <div class="comment-list">
                            ${responseData.Comments && responseData.Comments.length > 0 
                                ? responseData.Comments.map(comment => `
                                    <div class="Post-box">
                                        <h3>${sanitizeHtml(comment.Author)}</h3>
                                        <div class="comment-content">
                                            <p class="comment-text">${sanitizeHtml(comment.Content)}</p>
                                        </div>
                                        <h6>${sanitizeHtml(comment.Created_at)}</h6>
                                    </div>
                                `).join("") 
                                : `<p class="no-comments">No comments yet. Be the first to comment!</p>`
                            }
                        </div>
                    </div>
                </div>`;
                
            // Add event listener for comment validation
            setupCommentValidation();
        } else {
            content.innerHTML = `
                <div class="info-post">
                    <div class="comment-box">
                        <h1>Post not found</h1>
                        <p>The post you're looking for doesn't exist or has been removed.</p>
                        <a href="/" class="button-primary post">Back to Home</a>
                    </div>
                </div>`;
        }
    } catch (error) {
        console.error("Error fetching post data:", error);
        document.getElementById("content").innerHTML = `
            <div class="info-post">
                <div class="comment-box">
                    <h1>Error Loading Post</h1>
                    <p>There was a problem loading this post. Please try again later.</p>
                    <a href="/" class="button-primary post">Back to Home</a>
                </div>
            </div>`;
    }
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

// Function to validate the comment form
function validateCommentForm() {
    const commentEl = document.getElementById('Comment');
    const errorEl = document.getElementById('CommentError');
    
    if (!commentEl || !errorEl) return true;
    
    let comment = commentEl.value.trim();
    
    // Check if comment is empty
    if (comment === '') {
        errorEl.textContent = 'Please enter a comment.';
        errorEl.style.display = 'block';
        return false;
    }
    
    // Check if comment is too short
    if (comment.length < 3) {
        errorEl.textContent = 'Your comment is too short. Please enter at least 3 characters.';
        errorEl.style.display = 'block';
        return false;
    }
    
    // Remove HTML tags
    comment = comment.replace(/<[^>]*>/g, '');
    commentEl.value = comment;
    
    errorEl.style.display = 'none';
    return true;
}

// Setup event listeners for comment validation
function setupCommentValidation() {
    const commentEl = document.getElementById('Comment');
    const errorEl = document.getElementById('CommentError');
    
    if (commentEl && errorEl) {
        commentEl.addEventListener('input', function() {
            // Remove HTML tags while typing
            this.value = this.value.replace(/<[^>]*>/g, '');
            errorEl.style.display = 'none';
        });
        
        // Add validation to the form
        const form = commentEl.closest('form');
        if (form) {
            form.addEventListener('submit', function(event) {
                if (!validateCommentForm()) {
                    event.preventDefault();
                }
            });
        }
    }
}