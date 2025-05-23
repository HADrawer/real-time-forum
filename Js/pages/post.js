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
            
            
            content.innerHTML = `
                <div class="info-post">
                    <div class="comment-box">
                        <h1 id="post-title"></h1>
                        <h3>Content:</h3>
                        <div class="post-content">
                            <p id="post-content"></p>
                        </div>
                        <div class="author-info">
                            <p>Posted by <span class="author-name" id="post-author"></span></p>
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
                                    <div class="Post-box" id="commment-${comment.ID}">
                                        <h3 id="comment-author-${comment.ID}"></h3>
                                        <div class="comment-content">
                                            <p class="comment-text" id="comment-content-${comment.ID}"></p>
                                        </div>
                                        <h6 id="comment-date-${comment.ID}"></h6>
                                    </div>
                                `).join("") 
                                : `<p class="no-comments">No comments yet. Be the first to comment!</p>`
                            }
                        </div>
                    </div>
                </div>`;

                document.getElementById(`post-title`).textContent = responseData.Post.Title;
                document.getElementById(`post-content`).textContent = responseData.Post.Content;
                document.getElementById(`post-author`).textContent = responseData.Post.Author;
                
                if(responseData.Comments && responseData.Comments.length > 0) {
                    responseData.Comments.forEach(comment => {
                        document.getElementById(`comment-author-${comment.ID}`).textContent = comment.Author ;
                        document.getElementById(`comment-content-${comment.ID}`).textContent = comment.Content ;
                        document.getElementById(`comment-date-${comment.ID}`).textContent = comment.Created_at ;    
                    });
                }


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


// Function to validate the comment form
function validateCommentForm() {
    const commentEl = document.getElementById('Comment');
    const errorEl = document.getElementById('CommentError');
    
    if (!commentEl || !errorEl) return true;
    
    const comment = commentEl.value.trim();
    
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
    
    // Check for HTML tags
  
    
    errorEl.style.display = 'none';
    return true;
}

// Setup event listeners for comment validation
function setupCommentValidation() {
    const commentEl = document.getElementById('Comment');
    const errorEl = document.getElementById('CommentError');
    
    if (commentEl && errorEl) {
        commentEl.addEventListener('input', function() {
            // Check for HTML tags while typing
           
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