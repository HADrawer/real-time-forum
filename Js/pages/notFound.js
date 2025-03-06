
export function renderNotFoundPage() {
    document.getElementById('content').innerHTML = `
        <div class="container-404">
            <h1>404 - Page Not Found</h1>
            <p>Oops! The page you're looking for doesn't exist.</p>
            <button onclick="location.reload();"><a href="/">Go Back</a></button>
        </div>`;
}