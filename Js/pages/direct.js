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
                <div id="messageError" class="message-error"></div>
                <button class="chat-send" id="sendMessage">Send</button>
            </div>
        </div>`;

    const socket = new WebSocket(`ws://${window.location.hostname}:8080/ws`);
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const messageError = document.getElementById('messageError');
    const sendMessageButton = document.getElementById('sendMessage');
    // const userList = document.getElementById('userList');
    // const chatWith = document.getElementById('chatWith');
    const chatVisible = document.getElementById('ChatArea');
    chatVisible.classList.add('hidden');

    // Set up input validation
    setupMessageValidation();
    
    fetchUsersAndUpdateList();

    socket.onopen = () => {
        console.log("WebSocket connection established");
    };

    sendMessageButton.addEventListener('click', () => {
        if (validateMessageInput()) {
            sendMessage();
        }
    });

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "userListUpdate") {
            updateUserList(msg.data.users);
        } else if (msg.type === "message") {
            if ((currentReceiverId === msg.data.sender_id) || (currentReceiverId === msg.data.receiver_id && msg.data.sender_id === currentUserID)) {
                displayMessage(msg.data);
            }
        } else if (msg.type === "offline") {
            alert(msg.data);
        }
    };

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (validateMessageInput()) {
                sendMessage();
            }
            e.preventDefault(); // Prevent default Enter behavior
        }
    });

    function setupMessageValidation() {
        if (messageInput && messageError) {
            messageInput.addEventListener('input', function() {
                validateMessageInput(false); // Don't show error on typing
            });
        }
    }

    function validateMessageInput(showError = true) {
        let message = messageInput.value.trim();
        
        // Check if message is empty
        if (message === '') {
            if (showError) {
                showMessageError('Please enter a message.');
            }
            return false;
        }
        
        // Remove HTML tags
        message = message.replace(/<[^>]*>/g, '');
        messageInput.value = message;
        
        // Hide error message
        hideMessageError();
        return true;
    }

    function showMessageError(message) {
        if (messageError) {
            messageError.textContent = message;
            messageError.style.display = 'block';
        }
    }

    function hideMessageError() {
        if (messageError) {
            messageError.style.display = 'none';
        }
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message && currentReceiverId) {
            const msg = {
                receiver_id: currentReceiverId,
                message: message
            };
            socket.send(JSON.stringify(msg));
            messageInput.value = '';
            hideMessageError();
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
        
        // Sanitize the message content to prevent XSS
        const sanitizedMessage = sanitizeHtml(msg.message);
        const sanitizedTime = msg.createdTime ? sanitizeHtml(msg.createdTime) : '';
        const sanitizedUsername = msg.username ? sanitizeHtml(msg.username) : '';
        
        // Add a class based on whether this is a sent or received message
        if (msg.sender_id === currentUserID) {
            messageDiv.classList.add('sent');
            messageDiv.innerHTML = `
                <h5>
                    <span><strong>You:</strong> ${sanitizedMessage}</span>
                    <time>${sanitizedTime}</time>
                </h5>`;
        } else {
            messageDiv.classList.add('received');
            messageDiv.innerHTML = `
                <h5>
                    <span><strong>${sanitizedUsername}:</strong> ${sanitizedMessage}</span>
                    <time>${sanitizedTime}</time>
                </h5>`;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
    
                        // Sanitize content to prevent XSS
                        const sanitizedContent = sanitizeHtml(msg.Content);
                        const sanitizedUsername = sanitizeHtml(msg.Username || '');
                        
                        if (msg.Sender_ID === currentUserID && msg.Receiver_ID === currentReceiverId) {
                            messageDiv.classList.add('sent');
                            messageDiv.innerHTML = `
                                <h5>
                                    <span><strong>You:</strong> ${sanitizedContent}</span>
                                    <time>${formattedDate}</time>
                                </h5>`;
                        } else if (msg.Receiver_ID === currentUserID) {
                            messageDiv.classList.add('received');
                            messageDiv.innerHTML = `
                                <h5>
                                    <span><strong>${sanitizedUsername}:</strong> ${sanitizedContent}</span>
                                    <time>${formattedDate}</time>
                                </h5>`;
                        }
                        messagesContainer.appendChild(messageDiv);
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

    function updateUserList(users) {
        const userList = document.getElementById("userList");
        userList.innerHTML = ""; // Clear the current user list

        users.forEach(userObj => {
            const user = userObj.user;
            const isOnline = userObj.isOnline;


            const userItem = document.createElement("li");
            const userNameSpan = document.createElement("span");
            userItem.textContent = sanitizeHtml(user.Username);

            if (isOnline) {
                const onlineIndicator = document.createElement("span");
                onlineIndicator.classList.add("online-indicator");
                userItem.appendChild(onlineIndicator);
            }

            userItem.appendChild(userNameSpan);

            userItem.onclick = () => {
                currentReceiverId = user.ID;
                document.getElementById("chatWith").textContent = sanitizeHtml(user.Username);
                document.getElementById("ChatArea").classList.remove("hidden");
                fetchMessages(currentReceiverId);
            };

            userList.appendChild(userItem);
        });
    }

    // Function to sanitize HTML and prevent XSS
    function sanitizeHtml(text) {
        if (!text) return '';
        
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    history.pushState({}, "direct", "/Direct");
}