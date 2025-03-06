// filepath: /c:/Users/zain4/real-time-forum/Js/app.js
import { handleNavigation } from './utils/navigation.js';

document.addEventListener("DOMContentLoaded", function() {
    handleNavigation();

    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            const path = this.getAttribute('href');
            history.pushState({}, "", path);
            handleNavigation();
        });
    });

    window.addEventListener('popstate', handleNavigation);
});