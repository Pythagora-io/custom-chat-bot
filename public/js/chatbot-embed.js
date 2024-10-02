(function() {
    console.log('Chatbot embed script started execution');

    var script = document.currentScript || document.scripts[document.scripts.length - 1];
    var apiKey = '__API_KEY__';
    var chatbotId = '__CHATBOT_ID__';
    var location = '__CHATBOT_LOCATION__';
    var primaryColor = '__PRIMARY_COLOR__';
    var secondaryColor = '__SECONDARY_COLOR__';
    var textColor = '__TEXT_COLOR__';

    console.log('Chatbot embed script initialized with:', { apiKey, chatbotId, location, primaryColor, secondaryColor, textColor });

    function injectChatbot() {
        var chatbotContainer = document.createElement('div');
        chatbotContainer.id = 'pythagora-chatbot';
        chatbotContainer.classList.add('chatbot-container');
        chatbotContainer.style.position = 'fixed';
        chatbotContainer.style.bottom = '20px';
        chatbotContainer.style[location] = '20px';
        chatbotContainer.style.zIndex = '1000';

        var chatbotButton = document.createElement('button');
        chatbotButton.textContent = 'Chat';
        chatbotButton.style.padding = '10px 20px';
        chatbotButton.style.backgroundColor = primaryColor;
        chatbotButton.style.color = textColor;
        chatbotButton.style.border = 'none';
        chatbotButton.style.borderRadius = '5px';
        chatbotButton.style.cursor = 'pointer';

        var chatWidget = document.createElement('div');
        chatWidget.id = 'pythagora-chat-widget';
        chatWidget.style.display = 'none';
        chatWidget.style.width = '300px';
        chatWidget.style.height = '400px';
        chatWidget.style.backgroundColor = '#fff';
        chatWidget.style.border = '1px solid ' + secondaryColor;
        chatWidget.style.borderRadius = '5px';
        chatWidget.style.overflow = 'hidden';
        chatWidget.style.flexDirection = 'column';

        var chatMessages = document.createElement('div');
        chatMessages.id = 'pythagora-chat-messages';
        chatMessages.style.height = 'calc(100% - 40px)';
        chatMessages.style.overflowY = 'auto';
        chatMessages.style.padding = '10px';
        chatMessages.style.display = 'flex';
        chatMessages.style.flexDirection = 'column';

        var chatInput = document.createElement('input');
        chatInput.type = 'text';
        chatInput.placeholder = 'Type your message...';
        chatInput.style.width = '100%';
        chatInput.style.padding = '10px';
        chatInput.style.border = 'none';
        chatInput.style.borderTop = '1px solid ' + secondaryColor;

        chatWidget.appendChild(chatMessages);
        chatWidget.appendChild(chatInput);

        chatbotContainer.appendChild(chatbotButton);
        chatbotContainer.appendChild(chatWidget);
        document.body.appendChild(chatbotContainer);

        chatbotButton.addEventListener('click', function() {
            console.log('Chat button clicked. Current display state:', chatWidget.style.display);
            if (chatWidget.style.display === 'none') {
                chatWidget.style.display = 'flex';
                chatbotContainer.style.height = 'auto'; // Show full widget
                console.log('Chat widget opened');
                initializeSocket();
            } else {
                chatWidget.style.display = 'none';
                chatbotContainer.style.height = 'auto'; // Only show button
                console.log('Chat widget closed');
            }
        });

        // Initially, only show the button
        chatbotContainer.style.height = 'auto';
        chatWidget.style.display = 'none';

        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage(chatInput.value);
                chatInput.value = '';
            }
        });
    }

    function initializeSocket() {
        console.log('Initializing socket connection. Script src:', script.src);
        console.log('Server URL:', new URL(script.src).origin);
        if (window.chatSocket) {
            console.log('Reusing existing socket connection');
            return;
        }
        console.log('Initializing new socket connection');
        var serverUrl = new URL(script.src).origin;
        var socketUrl = serverUrl; // Use the server URL derived from the script source

        console.log('Attempting to connect to socket URL:', socketUrl);

        // Explicitly use WebSockets as the transport method
        var socket = io(socketUrl, {
            transports: ['websocket'], // Use WebSockets for transport
            query: {
                apiKey: apiKey,
                chatbotId: chatbotId
            }
        });
        console.log('Socket object created:', socket);

        window.chatSocket = socket; // Store socket in window for reuse

        socket.on('connect', function() {
            console.log('Socket connected successfully. Socket ID:', socket.id);
            socket.emit('join', chatbotId);
            console.log('Emitted join event with chatbotId:', chatbotId);
            socket.emit('requestGreeting', chatbotId);
            console.log('Emitted requestGreeting event with chatbotId:', chatbotId);
        });

        socket.on('connect_error', function(error) {
            console.error('Socket connection error:', error);
        });

        socket.on('message', function(data) {
            console.log('Received message:', data);
            displayMessage(data.message, data.isUser);
        });

        window.sendMessage = function(message) {
            console.log('Sending message:', message);
            socket.emit('chatMessage', { chatbotId: chatbotId, message: message, isUser: true });
            displayMessage(message, true);
        };
    }

    function displayMessage(message, isUser) {
        var chatMessages = document.getElementById('pythagora-chat-messages');
        var messageWrapper = document.createElement('div');
        messageWrapper.style.display = 'flex';
        messageWrapper.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
        messageWrapper.style.marginBottom = '10px';

        var messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.padding = '8px 12px';
        messageElement.style.maxWidth = '70%';
        messageElement.style.backgroundColor = isUser ? secondaryColor : primaryColor;
        messageElement.style.color = textColor;
        messageElement.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        messageElement.style.borderRadius = isUser ? '15px 15px 0 15px' : '15px 15px 15px 0';

        messageWrapper.appendChild(messageElement);
        chatMessages.appendChild(messageWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    document.addEventListener('DOMContentLoaded', injectChatbot);

    console.log('Chatbot embed script finished execution');
})();