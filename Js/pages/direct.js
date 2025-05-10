let currentUserID;
let currentReceiverId;
let messageOffset = 0;
const messagesPerPage = 15;
let isLoadingMessages = false;
let allMessagesLoaded = false;
let scrollThrottleTimeout;
let selectedUser = null;

export function fetchAndRenderDirect(targetSelector = '#content1') {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    
    // Load CSS dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/Css/messages.css';
    document.head.appendChild(link);
    target.innerHTML = `
    <div class="sidebar">
        <h2>Conversations</h2>
        <ul class="user-list" id="userList"></ul>
    </div>
    <div class="chat-area hidden" id="ChatArea">
        <div class="chat-header">
            <button class="chat-back-btn" id="backToUsers">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
            </button>
            Chat with <span id="chatWith"></span>
        </div>
        <div class="chat-messages" id="messages"></div>
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
            // Show message in both sender and receiver's chat if they're in the same conversation
            if ((currentReceiverId === msg.data.receiver_id && msg.data.sender_id === currentUserID) || 
                (currentReceiverId === msg.data.sender_id && msg.data.receiver_id === currentUserID)) {
                displayMessage(msg.data);
                // Scroll to bottom when new message arrives
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // If this is our own message, mark it as read immediately
                if (msg.data.sender_id === currentUserID) {
                    markMessageAsReadUI(currentReceiverId);
                }
            } else {
                // Show notification for message from other user
                showNotification(msg.data.username, msg.data.message);
                // Update user list to show new unread message indicator
                fetchUsersAndUpdateList();
            }
        } else if (msg.type === "offline") {
            showToast(msg.data);
        } else if (msg.type === "messagesRead") {
            const receiverId = msg.data.receiver_id;
            markMessageAsReadUI(receiverId);
            fetchUsersAndUpdateList();
        }
    };

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (validateMessageInput()) {
                sendMessage();
            }
            e.preventDefault();
        }
    });
    document.getElementById('backToUsers')?.addEventListener('click', () => {
        document.getElementById('ChatArea').classList.add('hidden');
        document.querySelector('.sidebar').style.display = 'block';
    });
    // Add scroll event listener with throttling
    messagesContainer.addEventListener('scroll', handleScrollThrottled);

    function handleScrollThrottled() {
        if (!scrollThrottleTimeout) {
            scrollThrottleTimeout = setTimeout(() => {
                handleScroll();
                scrollThrottleTimeout = null;
            }, 200); // Throttle to 200ms
        }
    }

    function handleScroll() {
        // If we're near the top (within 50px) and not already loading
        if (messagesContainer.scrollTop < 50 && 
            !isLoadingMessages && 
            !allMessagesLoaded) {
            loadMoreMessages();
        }
    }

    function loadMoreMessages() {
        if (isLoadingMessages || allMessagesLoaded) return;
        
        isLoadingMessages = true;
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.textContent = 'Loading older messages...';
        messagesContainer.insertBefore(loadingDiv, messagesContainer.firstChild);
        
        // Calculate the next offset
        const nextOffset = messageOffset + messagesPerPage;
        
        fetch(`http://${window.location.hostname}:8080/messages?receiver_id=${currentReceiverId}&offset=${nextOffset}&limit=${messagesPerPage}`)
            .then(response => response.json())
            .then(newMessages => {
                // Remove loading indicator
                messagesContainer.removeChild(loadingDiv);
                
                if (newMessages.length === 0) {
                    allMessagesLoaded = true;
                    return;
                }
                
                // Store current scroll position
                const oldScrollHeight = messagesContainer.scrollHeight;
                const oldScrollTop = messagesContainer.scrollTop;
                
                // Add new messages to the top
                const fragment = document.createDocumentFragment();
                newMessages.reverse().forEach(msg => {
                    fragment.appendChild(createMessageElement(msg));
                });
                
                messagesContainer.insertBefore(fragment, messagesContainer.firstChild);
                
                // Adjust scroll position to maintain view
                messagesContainer.scrollTop = messagesContainer.scrollHeight - oldScrollHeight + oldScrollTop;
                
                // Update offset for next load
                messageOffset = nextOffset;
                isLoadingMessages = false;
                
                // If we got fewer than requested, we've reached the beginning
                if (newMessages.length < messagesPerPage) {
                    allMessagesLoaded = true;
                }
            })
            .catch(error => {
                console.error('Error loading more messages:', error);
                if (loadingDiv.parentNode === messagesContainer) {
                    messagesContainer.removeChild(loadingDiv);
                }
                isLoadingMessages = false;
            });
    }

    function setupMessageValidation() {
        if (messageInput && messageError) {
            messageInput.addEventListener('input', function() {
                validateMessageInput(false);
            });
        }
    }

    function validateMessageInput(showError = true) {
        let message = messageInput.value;
        
        // Check if message is empty or only contains whitespace
        if (message.trim() === '') {
            if (showError) {
                showMessageError('Please enter a message.');
            }
            return false;
        }
        
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

    function showToast(message) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.top = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.backgroundColor = '#333';
        toast.style.color = 'white';
        toast.style.padding = '10px 15px';
        toast.style.borderRadius = '6px';
        toast.style.marginBottom = '10px';
        toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Fade in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);
        
        // Fade out and remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
                // Remove container if empty
                if (toastContainer.children.length === 0) {
                    document.body.removeChild(toastContainer);
                }
            }, 300);
        }, 3000);
    }
   
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message && currentReceiverId) {
            const msg = {
                receiver_id: currentReceiverId,
                message: message
            };
            
            // Create a temporary message element immediately
            const tempMsg = {
                sender_id: currentUserID,
                receiver_id: currentReceiverId,
                username: "You", // Or fetch current username
                message: message,
                createdTime: new Date().toISOString(),
                isRead: 1 // Mark as read immediately for sender
            };
            
            displayMessage(tempMsg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Clear input
            messageInput.value = '';
            hideMessageError();
            
            // Then send via WebSocket
            socket.send(JSON.stringify(msg));
        }
    }

    function showNotification(title, message) {
        if (Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: '/images/notification-icon.png'
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { 
                        body: message,
                        icon: '/images/notification-icon.png'
                    });
                }
            });
        }
    }

    function fetchUsersAndUpdateList() {
        fetch(`http://${window.location.hostname}:8080/users`)
            .then(response => response.json())
            .then(data => {
                currentUserID = data.sender_id;
                updateUserList(data.users);
            })
            .catch(error => console.error('Error fetching users:', error));
    }

    function displayMessage(msg) {
        messagesContainer.appendChild(createMessageElement(msg));
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function createMessageElement(msg) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('MessageContent');

        const date = new Date(msg.Created_at || msg.createdTime);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const hour = date.getHours();
        const minute = date.getMinutes();
        const formattedDate = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month} ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;

        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content-text');
        contentElement.textContent = msg.Content || msg.message;
        
        const timeElement = document.createElement('time');
        timeElement.textContent = formattedDate;

        messageDiv.appendChild(contentElement);
        messageDiv.appendChild(timeElement);

        if ((msg.Sender_ID === currentUserID || msg.sender_id === currentUserID) && 
            (msg.Receiver_ID === currentReceiverId || msg.receiver_id === currentReceiverId)) {
            messageDiv.classList.add('sent');
        } else if (msg.Receiver_ID === currentUserID || msg.receiver_id === currentUserID) {
            messageDiv.classList.add('received');
            if (msg.IsRead === 0 || msg.isRead === 0) {
                messageDiv.classList.add('unread');
            }
        }

        return messageDiv;
    }

    function fetchMessages(receiver_id) {
        // Reset pagination state for new conversation
        messageOffset = 0;
        allMessagesLoaded = false;
        isLoadingMessages = true;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Show initial loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.textContent = 'Loading messages...';
        messagesContainer.appendChild(loadingDiv);
        
        fetch(`http://${window.location.hostname}:8080/messages?receiver_id=${receiver_id}&offset=0&limit=${messagesPerPage}`)
            .then(response => response.json())
            .then(messages => {
                // Remove loading indicator
                messagesContainer.removeChild(loadingDiv);
                
                if (messages.length > 0) {
                    // Add messages in chronological order (newest at bottom)
                    messages.forEach(msg => {
                        messagesContainer.appendChild(createMessageElement(msg));
                    });
                    
                    // Scroll to bottom to show newest messages
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    
                    // Check if we've loaded all messages
                    if (messages.length < messagesPerPage) {
                        allMessagesLoaded = true;
                    }
                } else {
                    const noMessagesDiv = document.createElement('div');
                    noMessagesDiv.classList.add('no-messages');
                    noMessagesDiv.textContent = 'No messages yet. Say hello!';
                    noMessagesDiv.style.textAlign = 'center';
                    noMessagesDiv.style.padding = '2rem';
                    noMessagesDiv.style.color = '#888';
                    messagesContainer.appendChild(noMessagesDiv);
                }
                
                isLoadingMessages = false;
            })
            .catch(error => {
                console.error('Error fetching messages:', error);
                messagesContainer.removeChild(loadingDiv);
                const errorDiv = document.createElement('div');
                errorDiv.classList.add('MessageContent', 'error');
                errorDiv.textContent = 'Error loading messages';
                messagesContainer.appendChild(errorDiv);
                isLoadingMessages = false;
            });
    }

    function updateUserList(users) {
        const userList = document.getElementById("userList");
        userList.innerHTML = "";

        users.forEach(userObj => {
            const user = userObj.user;
            const isOnline = userObj.isOnline;
            const lastMessage = userObj.lastMessage;
            const hasUnread = lastMessage && 
                              (lastMessage.receiver_id === currentUserID || lastMessage.ReceiverID === currentUserID) && 
                              (lastMessage.isRead === 0 || lastMessage.IsRead === 0);

            const userItem = document.createElement("li");
            userItem.classList.add('user-item');
            
            // Create user info container
            const userInfoDiv = document.createElement('div');
            userInfoDiv.classList.add('user-info');
            
            // User name
            const userName = document.createElement('span');
            userName.classList.add('user-name');
            userName.textContent = user.Username;
            userInfoDiv.appendChild(userName);
            
            // User status indicators container
            const statusContainer = document.createElement('div');
            statusContainer.classList.add('status-indicators');
            
            // Add notification indicator for unread messages
            if (hasUnread) {
                const notificationIndicator = document.createElement("span");
                notificationIndicator.classList.add("notification-indicator");
                // If we have a count of unread messages, we could show it here
                notificationIndicator.textContent = "1"; // Default to 1 if count unknown
                statusContainer.appendChild(notificationIndicator);
                
                // Add 'unread' class to highlight user with unread messages
                userItem.classList.add('unread');
            }
            
            // Add online indicator
            if (isOnline) {
                const onlineIndicator = document.createElement("span");
                onlineIndicator.classList.add("online-indicator");
                statusContainer.appendChild(onlineIndicator);
                
                // Add 'online' class to user item
                userItem.classList.add('online');
            }
            
            userItem.appendChild(userInfoDiv);
            userItem.appendChild(statusContainer);
            
            // Set active class if this user is currently selected
            if (currentReceiverId === user.ID) {
                userItem.classList.add('selected');
            }

            userItem.onclick = () => {
                // Remove selected class from previous selection
                const selectedItems = userList.querySelectorAll('.selected');
                selectedItems.forEach(item => item.classList.remove('selected'));
                
                // Add selected class to current selection
                userItem.classList.add('selected');
                
                currentReceiverId = user.ID;
                document.getElementById("chatWith").textContent = user.Username;
                document.getElementById("ChatArea").classList.remove("hidden");
                
                // Remove unread class once the user is selected
                userItem.classList.remove('unread');
                
                markMessageAsRead(currentReceiverId, currentUserID);
                fetchMessages(currentReceiverId);
            };

            userList.appendChild(userItem);
        });
    }

    function markMessageAsRead(senderId, receiverId) {
        const data = {
            sender_id: senderId,
            receiver_id: receiverId
        };
        fetch(`http://${window.location.hostname}:8080/messages/markAsRead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Messages marked as read:', data);
            markMessageAsReadUI(senderId);
            fetchUsersAndUpdateList(); // Update user list to remove unread indicators
        })
        .catch(error => {
            console.error('Error marking messages as read:', error);
        });
    }

    function markMessageAsReadUI(senderId) {
        const messages = messagesContainer.querySelectorAll('.MessageContent');

        messages.forEach(messageDiv => {
            if (messageDiv.classList.contains('received') && 
                messageDiv.classList.contains('unread') && 
                currentReceiverId == senderId) {
                messageDiv.classList.remove('unread');
            }
        });
    }
}