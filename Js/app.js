import {fetchAndRenderDirect } from './direct.js';
import {fetchAndRenderPost } from './post.js';
import { fetchAndRenderCreate} from './create.js';
import { fetchAndRenderLogin} from './login.js';
import { fetchAndRenderRegister} from './register.js';
import {fetchAndRenderHomePage } from './homepage.js';

document.addEventListener("DOMContentLoaded", function(){
    handleNavigation();


    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (event){
            event.preventDefault();

            const path = this.getAttribute('href');
            history.pushState({},"",path);
            handleNavigation();
        });
    });
    
    window.addEventListener('popstate',handleNavigation);
});



function handleNavigation() {
    let path = window.location.pathname;

    if (path === "/") {
        fetchAndRenderHomePage()
    }else if (path === "/register"){
        fetchAndRenderRegister()
    }else if (path === "/login"){
        fetchAndRenderLogin()
    }else if (path === "/Create"){
        fetchAndRenderCreate()
    }else if(path === "/Direct"){
        fetchAndRenderDirect()
    }else if (path.startsWith("/Post")){
        fetchAndRenderPost()
    }else {
        if (path !== "/404"){
            window.location.href = '/404';
        }
        renderNotFoundPage()
    }

}


function renderNotFoundPage(){
    
    document.getElementById('content').innerHTML = ` 
    <div class="container-404">
        <h1>404 - Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <button onclick="location.reload();"><a href="/">Go Back</a></button>
    </div>`;

}


