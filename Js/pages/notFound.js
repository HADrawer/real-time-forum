export function renderNotFoundPage() {
    // Dynamically load the notFound.css file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/notFound.css';
    document.head.appendChild(link);
    
    // Hide header and footer if they exist
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    if (header) {
        header.style.display = 'none';
    }
    
    if (footer) {
        footer.style.display = 'none';
    }
    
    document.getElementById('content').innerHTML = `
        <div class="container-404">
            <div class="site-logo">
                <a href="/">Real-Time Forum</a>
            </div>
            <i class="fas fa-exclamation-circle error-icon"></i>
            <h1>404 - Page Not Found</h1>
            <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
            
            <div class="error-container">
                <div class="error-message">Error: Page not found on this server</div>
            </div>
            
            <p>Let's get you back on track:</p>
            <button onclick="window.location.href='/'">Back to Home</button>
        </div>`;
}