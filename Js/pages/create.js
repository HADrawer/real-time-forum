
export function fetchAndRenderCreate() {
    fetch("/api/create-data")
        .then(response => response.json())
        .then(data => {
            const content = document.getElementById("content");
            if (content) {
                content.innerHTML = `
                    <div class="create-container">
                        <form action="/Create" method="post">
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
                                        <div id="categoryError" style="color:red; display:none; margin-top: 8px;"></div>
                                    </div>
                                    <button type="submit" class="post">Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>`;
            }
        });
}