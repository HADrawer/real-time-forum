let currentUserID;
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
                Chat with <span id="chatWith"> </span>
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

  
    fetchUsersAndUpdateList()

    socket.onopen = () => {
        console.log("WebSocket connection established");

    };

    sendMessageButton.addEventListener('click', () => {
        sendMessage();
        
    });

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "userListUpdate") {
            updateUserList(msg.data.users);
        }else if (msg.type === "message") {

            if ((currentReceiverId === msg.data.sender_id) || (currentReceiverId === msg.data.receiver_id && msg.data.sender_id === currentUserID)) {
                displayMessage(msg.data);
            }
        }
        
    };

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
            sendMessageButton.click();
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

            fetchMessages(currentReceiverId);
        }
    }
    function fetchUsersAndUpdateList() {
        fetch(`http://${window.location.hostname}:8080/users`)
            .then(response => response.json())
            .then(data => {
                currentUserID = data.sender_id;

                updateUserList(data.users); // Update the user list
            })
            .catch(error => console.error('Error fetching users:', error));
    }
    function displayMessage(msg) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('MessageContent');
        
        // Add a class based on whether this is a sent or received message
        if (msg.sender_id === currentUserID) {
            messageDiv.classList.add('sent');
            messageDiv.innerHTML = `<h5><strong>You:</strong> ${msg.message} , ${msg.createdTime}</h5>`;
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
                    
                    const date = new Date(msg.Created_at);
                    
                    const day = date.getDate();
                    const month = date.getMonth() + 1;  // Months are 0-indexed, so we add 1
                    const hour = date.getHours();
                    const minute = date.getMinutes();

                    const formattedDate = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month} ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;

                    if (msg.Sender_ID === currentUserID && msg.Receiver_ID === currentReceiverId) {
                        messageDiv.classList.add('sent');
                        messageDiv.innerHTML = `<h5><strong>You:</strong> ${msg.Content} , ${formattedDate}</h5>`;
                    } else if( msg.Receiver_ID === currentUserID) {
                        messageDiv.classList.add('received');
                        messageDiv.innerHTML = `<h5><strong>${msg.Username}:</strong> ${msg.Content}, ${formattedDate}</h5>`;
                    }
                    messagesContainer.appendChild(messageDiv);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;

                });
            } else {
                const noMessagesDiv = document.createElement('div');
                noMessagesDiv.classList.add('MessageContent');
                noMessagesDiv.innerHTML = '<h5>No messages available</h5>';
                messagesContainer.appendChild(noMessagesDiv);
            }

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = '<h5>Error fetching messages</h5>';
        });
}



function updateUserList(users){
    const userList = document.getElementById("userList");
    userList.innerHTML = ""; // Clear the current user list

    users.forEach(userObj => {
        const user = userObj.user;
        const lastMessage = userObj.lastMessage;

        const userItem = document.createElement("li");
        userItem.textContent = user.Username;

        userItem.onclick = () => {
            currentReceiverId = user.ID;
            document.getElementById("chatWith").textContent = user.Username;
            document.getElementById("ChatArea").classList.remove("hidden");
            fetchMessages(currentReceiverId);
        };

        userList.appendChild(userItem);
    });
}