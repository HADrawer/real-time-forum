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
                // Extract posts and categories from the response
                const posts = data.Posts || [];
                const categories = data.Categories || [];

                // Render the categories in the sidebar
                const categoryList = categories.map(cat => `
                    <li><a href="/?category=${cat.Name}" class="category-link">${cat.Name}</a></li>
                `).join('');

                // Render the posts with real categories
                const postsHtml = posts.length > 0 ? posts.map(post => {
                    const categories = post.Category ? post.Category.map(cat => cat.Name).join(', ') : 'Uncategorized';
                    return `
                        <div class="content">
                            <div class="infoStupid">
                                <a href="/Post?id=${post.ID}"><h3>${post.Title}</h3></a>
                                <p>Posted by ${post.Author}</p>
                                <div class="post-meta">
                                    <span class="timestamp">${getRandomTimestamp()}</span>
                                    <div class="categories-tags">
                                        <span class="category-tag">${categories}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="stats">
                                <span class="reply-count">${Math.floor(Math.random() * 50)}</span>
                                <span class="reply-label">replies</span>
                            </div>
                        </div>
                    `;
                }).join('') : `
                    <div class="no-posts">
                        <h1>No posts found. Be the first to create a discussion!</h1>
                    </div>
                `;

                // Render the entire content
                content.innerHTML = `
                    <!-- Welcome Banner -->
                    <div class="welcome-banner">
                        <h1>Welcome to Real-Time Forum</h1>
                        <p>Join the conversation and connect with other members of our community</p>
                    </div>
                    
                    <div class="content-wrapper">
                        <!-- Left Sidebar -->
                        <div class="sidebar">
                            <h3>Categories</h3>
                            <ul>
                                <li><a href="/" class="active">All Topics</a></li>
                                ${categoryList}
                            </ul>
                        </div>
                        
                        <!-- Main Content Area -->
                        <div class="posts">
                            <!-- Sorting Dropdown -->
                            <div class="sort-controls">
                                <div>
                                    <label for="sort-by">Sort by:</label>
                                    <select id="sort-by" onchange="sortPosts(this.value)">
                                        <option value="latest">Latest</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="replies">Most Replies</option>
                                    </select>
                                </div>
                            </div>
                            
                            ${postsHtml}
                        </div>
                    </div>
                `;

                // Add event listeners for category links
                document.querySelectorAll('.category-link').forEach(link => {
                    link.addEventListener('click', function(event) {
                        event.preventDefault();
                        const category = this.getAttribute('href').split('=')[1];
                        filterPostsByCategory(category);
                    });
                });

                // Add event listener for sorting
                document.getElementById('sort-by')?.addEventListener('change', function() {
                    sortPosts(this.value);
                });
            }
        })
        .catch(error => {
            console.error("Error fetching home page data:", error);
            // Display an error message to the user
            const content = document.getElementById("content");
            if (content) {
                content.innerHTML = `
                    <div class="error-message">
                        <h1>Failed to load posts. Please try again later.</h1>
                    </div>
                `;
            }
        });
}

// Function to filter posts by category
function filterPostsByCategory(category) {
    fetch(`/api/home-data?category=${category}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const filteredPosts = data.Posts || [];
            const postsHtml = filteredPosts.length > 0 ? filteredPosts.map(post => {
                const categories = post.Category ? post.Category.map(cat => cat.Name).join(', ') : 'Uncategorized';
                return `
                    <div class="content">
                        <div class="infoStupid">
                            <a href="/Post?id=${post.ID}"><h3>${post.Title}</h3></a>
                            <p>Posted by ${post.Author}</p>
                            <div class="post-meta">
                                <span class="timestamp">${getRandomTimestamp()}</span>
                                <div class="categories-tags">
                                    <span class="category-tag">${categories}</span>
                                </div>
                            </div>
                        </div>
                        <div class="stats">
                            <span class="reply-count">${Math.floor(Math.random() * 50)}</span>
                            <span class="reply-label">replies</span>
                        </div>
                    </div>
                `;
            }).join('') : `
                <div class="no-posts">
                    <h1>No posts found in this category.</h1>
                </div>
            `;

            document.querySelector('.posts').innerHTML = postsHtml;
        })
        .catch(error => {
            console.error("Error filtering posts by category:", error);
            // Display an error message to the user
            const postsSection = document.querySelector('.posts');
            if (postsSection) {
                postsSection.innerHTML = `
                    <div class="error-message">
                        <h1>Failed to filter posts. Please try again later.</h1>
                    </div>
                `;
            }
        });
}

// Helper function to generate random timestamps for demo
function getRandomTimestamp() {
    const periods = ["Just now", "5 min ago", "10 min ago", "30 min ago", "1 hour ago", "3 hours ago", "8 hours ago", "Yesterday", "2 days ago"];
    return periods[Math.floor(Math.random() * periods.length)];
}

// Function to sort posts (for demo purposes)
function sortPosts(sortBy) {
    console.log(`Sorting posts by: ${sortBy}`);
    // In a real implementation, this would re-fetch or re-sort the posts
    // For demo, we'll just log the sort type
}