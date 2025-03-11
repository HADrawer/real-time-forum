export async function fetchAndRenderPost() {
      // Dynamically load the post.css file
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/Css/post.css';
      document.head.appendChild(link);
      
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

    const response = await fetch('/api/post-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        const data = await response.json();
        const content = document.getElementById("content");
        if (content) {
            if (data.Post) {
                content.innerHTML = `
                    <div class="info-post">
                        <div class="comment-box">
                            <h1>${data.Post.Title}</h1>
                            <h3>Content:</h3>
                            <p onclick="this.classList.toggle('expanded');">${data.Post.Content}</p>
                            <p>Author: ${data.Post.Author}</p>
                        </div>
                        <h2>Add a Comment</h2>
                        <form action="/Comment" method="post" onsubmit="return validateForm()">
                            <input name="PostID" value="${data.Post.ID}" type="hidden">
                            <textarea name="PostComment" id="Comment" placeholder="Write Your Comment here" maxlength="250" required></textarea><br>
                            <div id="CommentError" style="color:red; display:none;"></div>
                            <input type="submit" class="button-primary post" value="Add Comment">
                        </form>
                        <hr class="divider">
                        <h2>Comments</h2>
                        <ul>
                            ${data.Comments && data.Comments.length > 0 ? data.Comments.map(comment => `
                                <div class="Post-box">
                                    <h3>${comment.Author}</h3>
                                    <div class="comment-content" onclick="this.classList.toggle('expanded');">
                                        <p class="comment-text">${comment.Content}</p>
                                    </div>
                                    <h6>${comment.Created_at}</h6>
                                </div>
                            `).join("") : `<p>No comments yet.</p>`}
                        </ul>
                    </div>`;
            } else {
                content.innerHTML = `<p>Post not found.</p>`;
            }
        }
    } else {
        console.log("Error fetching post data");
    }
}