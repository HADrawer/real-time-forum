export function fetchAndRenderDirect(){
    
    document.getElementById('content').innerHTML = ` 
        <div class="sidebar">
                    <h2>Users</h2>
                    <ul class="user-list" id="userList">
                    </ul>
                </div>
                            
                <div class="chat-area" id="ChatArea">
                    <div class="chat-header">
                        Chat with <span id="chatWith"> </span>
                    </div>

                    <div class="chat-messages" id="messages">
                        <!-- Messages will appear here -->
                        
                    </div>
                    <div class="chat-input-container">
                        <input type="text" class="chat-input" id="messageInput" placeholder="Type a message..." />
                        <button class="chat-send" id="sendMessage">Send</button>
                    </div>
                </div>  
    `;

    const socket = new WebSocket(`ws://${window.location.hostname}:8080/ws`);
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const userList = document.getElementById('userList');
    const chatWith = document.getElementById('chatWith');
    const chatVisible = document.getElementById('ChatArea');
    chatVisible.classList.add('hidden');
    fetch(`http://${window.location.hostname}:8080/users`)
        .then(response => response.json())
        .then(data => {
            let currentSenderid;

            currentSenderid = data.sender_id;
            const users = data.users;
            users.forEach(user => {
                if (user.ID !== currentSenderid) {
                const userItem = document.createElement('li');
                userItem.textContent = user.Username;
                userItem.onclick = () => {
                    currentReceiverId = user.ID;
                    chatWith.textContent = user.Username;
                    chatVisible.classList.remove('hidden');
                };
                userList.appendChild(userItem);
            };
            });
        })
        .catch(error => console.error('Error fetching users:', error));
                    
        socket.onopen = () => {
        const username = "You"; // This should be dynamically set based on the logged-in user
         socket.send(JSON.stringify({ username: username }));
        };      

                        //             socket.onopen = () => {
                        // console.log('Connected to WebSocket');
                        // // Send username once connected
                        // const username = prompt('Enter your username:');
                        // socket.send(JSON.stringify(username)); // Send username to server
                        //             };

        sendMessageButton.addEventListener('click', () => {
            const message = messageInput.value;
            if (message) {
                const msg = {
                    Username: 'You',
                    Message: message,
                    receiver_id : currentReceiverId
    
                };
 
                socket.send(JSON.stringify(msg));
                messageInput.value = '';
            }
        });
        socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('MessageContent');
                messageDiv.innerHTML = `<h5><strong>${msg.username}:</strong> ${msg.message}</h5>`;
                messagesContainer.appendChild(messageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
               
            };      
                    

        messageInput.addEventListener('keypress', (e)=> {
            if (e.key === 'Enter') {
                sendMessageButton.click();
            }
        });

    history.pushState({},"direct","/Direct")
}
