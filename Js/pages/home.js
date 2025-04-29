export function fetchAndRenderHomePage() {
   
   
    // Add CSS file to head
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/home.css';
    document.head.appendChild(link);

    // Fetch home page data
    fetch("/api/home-data")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const content = document.getElementById("content");
            if (content) {
                const posts = data.Posts || [];
                const categories = data.Categories || [];

                const urlParams = new URLSearchParams(window.location.search);
                const categoryParam = urlParams.get('category');
                const categoryIdFromParam = categories.find(cat => cat.Name === categoryParam)?.ID;

                // Render category list with data-id attributes
                const categoryList = categories.map(cat => `
                    <li><a href="/?category=${cat.Name}" class="category-link" data-id="${cat.ID}">${cat.Name}</a></li>
                `).join('');

                
                // const selectedCategoryId = categoryIdFromParam || 0;
                // const postsHtml = renderFilteredPosts(posts, selectedCategoryId);
                const postsHtml = categoryIdFromParam
             ? renderFilteredPosts(posts, categoryIdFromParam)
             : renderAllPosts(posts);


               
                content.innerHTML = `
                    <!-- Welcome Banner -->
                    <div class="welcome-banner">
                        <h1>Welcome to Real-Time Forum</h1>
                        <p>Join the conversation and connect with other members of our community</p>
                    </div>

                    <div class="content-wrapper">
                        <!-- Left Sidebar -->
                        <div class="sidebar-home">
                            <h3>Categories</h3>
                            <ul>
                                <li><a href="/" class="category-link" data-id="all">All Topics</a></li>
                                ${categoryList}
                            </ul>
                        </div>

                        <!-- Main Content Area -->
                        <div class="posts">
                            ${postsHtml}
                        </div>
                    </div>
                `;

            
                updatePostTitles(posts);

                // Add category click listeners
                document.querySelectorAll('.category-link').forEach(link => {
                    link.addEventListener('click', function(event) {
                        event.preventDefault();
                        const categoryId = this.dataset.id;

                        const filteredHtml = categoryId === "All"
                            ? renderAllPosts(posts)
                            : renderFilteredPosts(posts, Number(categoryId));

                        document.querySelector('.posts').innerHTML = filteredHtml;
                        updatePostTitles(posts);
                    });
                });

                
            }
        })
        .catch(error => {
            console.error("Error fetching home page data:", error);
            const content = document.getElementById("content");
            if (content) {
                content.innerHTML = `
                    <div class="error-message">
                        <h1>Failed to load posts. Please try again later.</h1>
                    </div>
                `;
            }
        });

    function renderFilteredPosts(posts, categoryId) {
        const html = posts.map(post => {
            const postCategories = post.Category || [];
            const categoryNames = postCategories.map(cat => cat.Name).join(', ') || 'Uncategorized';
            if (postCategories.some(cat => cat.ID === categoryId)) {
                return `
                    <div class="content-home">
                        <div class="infoStupid">
                            <a href="/Post?id=${post.ID}"><h3 id="post-title-${post.ID}"></h3></a>
                            <p>Posted by ${post.Author}</p>
                            <div class="post-meta">
                                <div class="categories-tags">
                                    <span class="category-tag">${categoryNames}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');

        return html || `
            <div class="no-posts">
                <h1>No posts found in this category.</h1>
            </div>
        `;
    }

    function renderAllPosts(posts) {
        const html = posts.map(post => {
            const postCategories = post.Category || [];
            const categoryNames = postCategories.map(cat => cat.Name).join(', ') || 'Uncategorized';
            return `
                <div class="content-home">
                    <div class="infoStupid">
                        <a href="/Post?id=${post.ID}"><h3 id="post-title-${post.ID}"></h3></a>
                        <p>Posted by ${post.Author}</p>
                        <div class="post-meta">
                            <div class="categories-tags">
                                <span class="category-tag">${categoryNames}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return html || `
            <div class="no-posts">
                <h1>No posts available. Be the first to create one!</h1>
            </div>
        `;
    }

    // Helper: set post titles after rendering
    function updatePostTitles(posts) {
        posts.forEach(post => {
            const titleElement = document.getElementById(`post-title-${post.ID}`);
            if (titleElement) {
                titleElement.textContent = post.Title;
            }
        });
    }
}
