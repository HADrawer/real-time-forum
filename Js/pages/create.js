
export function fetchAndRenderCreate() {

     // Dynamically load the create.css file
     const link = document.createElement('link');
     link.rel = 'stylesheet';
     link.href = '/Css/create.css';
     document.head.appendChild(link);

    fetch("/api/create-data")
        .then(response => response.json())
        .then(data => {
            const content = document.getElementById("content");
            if (content) {
                content.innerHTML = `
                    <div class="create-container">
                        <form id="createPostForm" action="/Create" method="post">
                            <div class="create-left">
                                <div class="create-left-title">
                                    <h2>Create Post</h2>
                                    <hr>
                                </div>
                                <input type="text" name="title" placeholder="Title" class="create-title" required>
                                <textarea type="text" name="content" placeholder="Write what you think about" class="create-title" required></textarea>
                                <div class="create-right">
                                    <div class="categories">
                                        ${data.Categories.map(category =>
                                            `<label class="check"><input type="checkbox" name="categories[]" value="${category.Name}"><span>${category.Name}</span></label>`
                                        ).join("")}
                                        <div id="categoryError" style="color:red; display:none; margin-top: 8px;">Please select at least one category.</div>                                    </div>
                                    <button type="submit" class="post">Submit</button>
                                </div>
                            </div>
                        </form>
                         <div id="messageContainer" style="display:none; margin-top: 20px;"></div>
                    </div>`;


                const form = document.getElementById("createPostForm");
                const messageContainer = document.getElementById("messageContainer");
                form.addEventListener('submit', function(event){
                    const checkboxes = form.querySelectorAll('input[name="categories[]"]:checked');
                    const categoryError = document.getElementById('categoryError');

                    if (checkboxes.length === 0) {
                        event.preventDefault();
                        categoryError.style.display = 'block';
                        messageContainer.style.display = 'none';
                    }else {
                        categoryError.style.display = 'none';                        
                    }
                })
            }
        });
}