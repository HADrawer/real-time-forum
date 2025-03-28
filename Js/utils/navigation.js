
import { fetchAndRenderHomePage } from '../pages/home.js';
import { fetchAndRenderRegister } from '../pages/register.js';
import { fetchAndRenderLogin } from '../pages/login.js';
import { fetchAndRenderCreatePost } from '../pages/create.js';
import { fetchAndRenderDirect } from '../pages/direct.js';
import { fetchAndRenderPost } from '../pages/post.js';
import { renderNotFoundPage } from '../pages/notFound.js';

export function handleNavigation() {
    let path = window.location.pathname;
    console.log("Current path:", path); // Debugging

    if (path === "/") {
        fetchAndRenderHomePage();
    } else if (path === "/register") {
        fetchAndRenderRegister();
    } else if (path === "/login") {
        fetchAndRenderLogin();
    } else if (path === "/Create") {
        fetchAndRenderCreatePost();
    } else if (path === "/Direct") {
        fetchAndRenderDirect();
    } else if (path.startsWith("/Post")) {
        fetchAndRenderPost();
    } else {
        if (path !== "/404") {
            window.location.href = '/404';
        }
        renderNotFoundPage();
    }
}