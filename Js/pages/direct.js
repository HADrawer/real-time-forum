// Updated direct.js with styling improvements
let currentSenderid;
let currentReceiverId;

export function fetchAndRenderDirect() {
    // Dynamically load the messages.css file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/messages.css';
    document.head.appendChild(link);

    document.getElementById('content').innerHTML = `
        <div class="sidebar">
            <h2>Users</h2>
            <ul class="user-list" id="userList"></ul>
        </div>
        <div class="chat-area" id="ChatArea">
            <div class="chat-header">
                Chat with <span id="chatWith"></span>
            </div>
            <div class="chat-messages" id="messages">
                <!-- Messages will appear here -->
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" id="messageInput" placeholder="Type a message..." />
                <button class="chat-send" id="sendMessage">Send</button>
            </div>
        </div>`;

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
            currentSenderid = data.sender_id;
            const users = data.users;
            users.forEach(user => {
                if (user.ID !== currentSenderid) {
                    const userItem = document.createElement('li');
                    userItem.textContent = user.Username;
                    userItem.setAttribute('data-user-id', user.ID);
                    
                    userItem.onclick = () => {
                        // Remove active class from all users
                        document.querySelectorAll('.user-list li').forEach(li => {
                            li.classList.remove('active');
                        });
                        
                        // Add active class to clicked user
                        userItem.classList.add('active');
                        
                        currentReceiverId = user.ID;
                        chatWith.textContent = user.Username;
                        chatVisible.classList.remove('hidden');
                        fetchMessages(currentReceiverId);
                    };
                    userList.appendChild(userItem);
                }
            });
        })
        .catch(error => console.error('Error fetching users:', error));

    socket.onopen = () => {
        console.log("WebSocket connection established");
    };

    sendMessageButton.addEventListener('click', () => {
        sendMessage();
    });

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        if ((currentReceiverId === msg.sender_id) || (currentReceiverId === msg.receiver_id && msg.sender_id === currentSenderid)) {
            displayMessage(msg);
        }
    };

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message && currentReceiverId) {
            const msg = {
                receiver_id: currentReceiverId,
                message: message
            };
            socket.send(JSON.stringify(msg));
            messageInput.value = '';
        }
    }

    function displayMessage(msg) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('MessageContent');
        
        // Add a class based on whether this is a sent or received message
        if (msg.sender_id === currentSenderid) {
            messageDiv.classList.add('sent');
            messageDiv.innerHTML = `<h5><strong>You:</strong> ${msg.message}</h5>`;
        } else {
            messageDiv.classList.add('received');
            messageDiv.innerHTML = `<h5><strong>${msg.username}:</strong> ${msg.message}</h5>`;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    history.pushState({}, "direct", "/Direct");
}

function fetchMessages(receiver_id) {
    fetch(`http://${window.location.hostname}:8080/messages?receiver_id=${receiver_id}`)
        .then(response => response.json())
        .then(messages => {
            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = ''; // Clear previous messages

            if (Array.isArray(messages) && messages.length > 0) {
                messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.classList.add('MessageContent');
                    
                    // Check if the message is sent by the current user or received
                    if (msg.SenderID === currentSenderid) {
                        messageDiv.classList.add('sent');
                        messageDiv.innerHTML = `<h5><strong>You:</strong> ${msg.Content}</h5>`;
                    } else {
                        messageDiv.classList.add('received');
                        messageDiv.innerHTML = `<h5><strong>${msg.Username}:</strong> ${msg.Content}</h5>`;
                    }
                    
                    messagesContainer.appendChild(messageDiv);
                });
            } else {
                const noMessagesDiv = document.createElement('div');
                noMessagesDiv.classList.add('MessageContent');
                noMessagesDiv.innerHTML = '<h5>No messages yet. Say hello!</h5>';
                messagesContainer.appendChild(noMessagesDiv);
            }

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = '<div class="MessageContent"><h5>Error loading messages. Please try again.</h5></div>';
        });
}