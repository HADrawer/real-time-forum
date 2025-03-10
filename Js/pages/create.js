
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
                                <input type="text" name="title" id="title" placeholder="Title" class="create-title" required>
                             
                                <div id="titleError" style="color:red; display:none; margin-top: 8px;">Please enter a title.</div>
                             
                                 
                                <textarea type="text" name="content" id="contentText" placeholder="Write what you think about" class="create-title" required></textarea>
                        
                                <div id="contentError" style="color:red; display:none; margin-top: 8px;">Please enter some content.</div>  
                        
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
                    const title = document.getElementById('title').value.trim();
                    const content = document.getElementById('contentText').value.trim();
                    const categoryError = document.getElementById('categoryError');
                    const titleError = document.getElementById('titleError');
                    const contentError = document.getElementById('contentError');

                    let formValid = true;

                    if (title === "") {
                        formValid = false;
                            titleError.style.display = 'block';      
                    }else {
                        titleError.style.display = 'none'; // Hide title error
                    }
                    
                    if (content === "") {
                        formValid = false;
                        contentError.style.display = 'block'; 
                    }else {
                        contentError.style.display = 'none'; // Hide content error
                    }

                    
                    if (checkboxes.length === 0) {
                        formValid = false;
                        event.preventDefault();
                        categoryError.style.display = 'block';
                        messageContainer.style.display = 'none';
                    }else {
                        categoryError.style.display = 'none';                        
                    }

                    if(!formValid) {
                        event.preventDefault();
                        messageContainer.style.display = 'none';
                    }else {
                        messageContainer.style.display = 'none'
                    }
                });
            }
        });
}