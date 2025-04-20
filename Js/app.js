
import { handleNavigation } from './utils/navigation.js';

document.addEventListener("DOMContentLoaded", function() {
    handleNavigation();

    // document.querySelectorAll('a').forEach(link => {
    //     link.addEventListener('click', function(event) {
    //         event.preventDefault();

    //         const path = this.getAttribute('href');
    //         history.pushState({}, "", path);
    //         handleNavigation();
    //     });
    // });

    document.body.addEventListener('click', function(event) {
        const link = event.target.closest('a');
        if(link && link.href.startsWith(window.location.origin)){
            event.preventDefault();
            const path = link.getAttribute('href');
            history.pushState({},"",path);
            handleNavigation();
        }
    });

    window.addEventListener('popstate', handleNavigation);
});