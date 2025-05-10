import { handleNavigation } from './utils/navigation.js';
import { fetchAndRenderDirect } from './pages/direct.js';

document.addEventListener("DOMContentLoaded", function () {
    handleNavigation();

    // Intercept internal link clicks
    document.body.addEventListener('click', function (event) {
        const link = event.target.closest('a');
        if (link && link.href.startsWith(window.location.origin)) {
            event.preventDefault();
            const path = link.getAttribute('href');
            history.pushState({}, "", path);
            handleNavigation();
        }
    });

    window.addEventListener('popstate', handleNavigation);

    // 🔥 Init global chat ONCE
    fetchAndRenderDirect('#globalChatContainer');

    const toggleBtn = document.getElementById('chatToggleBtn');
    const chatContainer = document.getElementById('globalChatContainer');

    toggleBtn.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        toggleBtn.innerHTML = chatContainer.classList.contains('hidden') ? '&#x25B2;' : '&#x25BC;';
    });
});
