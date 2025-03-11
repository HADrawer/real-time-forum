export function fetchAndRenderHomePage() {
    // Add CSS file to head
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/home.css';
    document.head.appendChild(link);
    
    // Fetch home page data
    fetch("/api/home-data")
        .then(response => response.json())
        .then(data => {
            const content = document.getElementById("content");
            if (content) {
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
                                <li><a href="/?category=Technology">Technology</a></li>
                                <li><a href="/?category=Sports">Sports</a></li>
                                <li><a href="/?category=Entertainment">Entertainment</a></li>
                                <li><a href="/?category=Science">Science</a></li>
                                <li><a href="/?category=Business">Business</a></li>
                                <li><a href="/?category=Health">Health</a></li>
                                <li><a href="/?category=Food">Food</a></li>
                                <li><a href="/?category=Travel">Travel</a></li>
                                <li><a href="/?category=Art">Art</a></li>
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
                            
                            ${data.Posts && data.Posts.length > 0 ? data.Posts.map(post => {
                                // Generate random values for demo purposes
                                const timestamp = getRandomTimestamp();
                                const categories = getRandomCategories();
                                const replyCount = Math.floor(Math.random() * 50);
                                
                                return `
                                <div class="content">
                                    <div class="infoStupid">
                                        <a href="/Post?id=${post.ID}"><h3>${post.Title}</h3></a>
                                        <p>Posted by ${post.Author}</p>
                                        <div class="post-meta">
                                            <span class="timestamp">${timestamp}</span>
                                            <div class="categories-tags">
                                                ${categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="stats">
                                        <span class="reply-count">${replyCount}</span>
                                        <span class="reply-label">replies</span>
                                    </div>
                                </div>
                            `}).join('') : `
                                <div class="no-posts">
                                    <h1>No posts found. Be the first to create a discussion!</h1>
                                </div>
                            `}
                        </div>
                    </div>
                `;
                
                // Add event listener for sorting
                document.getElementById('sort-by')?.addEventListener('change', function() {
                    sortPosts(this.value);
                });
            }
        })
        .catch(error => console.error("Error fetching home page data:", error));
}

// Helper function to generate random timestamps for demo
function getRandomTimestamp() {
    const periods = ["Just now", "5 min ago", "10 min ago", "30 min ago", "1 hour ago", "3 hours ago", "8 hours ago", "Yesterday", "2 days ago"];
    return periods[Math.floor(Math.random() * periods.length)];
}

// Helper function to generate random categories for demo
function getRandomCategories() {
    const allCategories = ["Technology", "Sports", "Entertainment", "Science", "Business", "Health", "Food", "Travel", "Art"];
    const numCategories = Math.floor(Math.random() * 2) + 1; // 1 or 2 categories
    const categories = [];
    
    for (let i = 0; i < numCategories; i++) {
        const randIndex = Math.floor(Math.random() * allCategories.length);
        categories.push(allCategories[randIndex]);
        allCategories.splice(randIndex, 1); // Remove to avoid duplicates
    }
    
    return categories;
}

// Function to sort posts (for demo purposes)
function sortPosts(sortBy) {
    console.log(`Sorting posts by: ${sortBy}`);
    // In a real implementation, this would re-fetch or re-sort the posts
    // For demo, we'll just log the sort type
}