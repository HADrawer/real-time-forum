export function fetchAndRenderHomePage(){
    fetch("/api/home-data")
        .then(response => response.json())
        .then(data =>{
            const content = document.getElementById("content");
            if (content){

                content.innerHTML = ` 
                 <div class="content-wrapper">
                            <div class="posts">
                            ${data.Posts.length > 0 ? data.Posts.map(post =>
                                `
                                <div class="content">
                                    <div class="infoStupid">
                                        <a href="/Post?id=${post.ID}"><h3>${post.Title}</h3></a>
                                        <p>Posted By ${post.Author}</p>
                                    </div>
                                </div>
                            `).join("") : `
                                <div class="content">
                                    <div class="info">
                                        <h1>No posts found.</h1>
                                    </div>
                                </div>
                                `}      
                            </div>
                        </div>
                `;
            }
        })
        .catch(error => console.error("Error fetching home page data:", error));
        
    }