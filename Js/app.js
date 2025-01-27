// document.addEventListener("DOMContentLoaded", function(){
//     handleNavigation();


//     document.querySelectorAll('a').forEach(link => {
//         link.addEventListener('click', function (event){
//             event.preventDefault();

//             const path = this.getAttribute('href');
//             history.pushState({},"",path);
//             handleNavigation();
//         });
//     });
    
//     window.addEventListener('popstate',handleNavigation);
// });


// function handleNavigation() {
//     let path = window.location.pathname;

//     if (path === "/") {

//     }else if (path === "/register"){

//     }else if (path === "/login"){

//     }else if (path === "/Direct"){

//     }else if (path === "/Create"){

//     }else {
//         renderNotFoundPage();
//     }

// }

// function fetchAndRenderHomePage(){

// }
// function fetchAndRenderRegister(){
    
// }
// function fetchAndRenderLogin(){
    
// }
// function fetchAndRenderDirect(){
    
// }
// function fetchAndRenderCreate(){
    
// }
// function renderNotFoundPage(){
    
// }