document.addEventListener('DOMContentLoaded', function() {
  console.log('ChatbotTest.js loaded');
  const chatContainer = document.getElementById('chat-container');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatbotId = chatContainer.dataset.chatbotId; // Updated to use chatbot's uniqueId
  const scriptTag = document.querySelector('script[src="/js/chatbotTest.js"]');
  const apiKey = scriptTag ? scriptTag.getAttribute('data-api-key') : null;
  console.log('Chatbot ID:', chatbotId);
  console.log('API Key:', apiKey);

  if (!apiKey) {
    console.error('API key not found. Please ensure the data-api-key attribute is set on the script tag.');
    return;
  }

  // Generate a unique conversation ID for each test chat session
  const uniqueConversationId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  console.log('Initializing socket connection with options:', {
    apiKey: apiKey,
    conversationId: uniqueConversationId,
    chatbotId: chatbotId
  });

  // Modify the socket connection to include apiKey, conversationId, and chatbotId
  const socket = io({
    query: {
      apiKey: apiKey,
      conversationId: uniqueConversationId,
      chatbotId: chatbotId
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5
  });
  console.log('Socket connection initialized with options:', {
    apiKey: apiKey,
    conversationId: uniqueConversationId,
    chatbotId: chatbotId
  });
  console.log('Socket object:', socket);

  socket.on('connect', () => {
    console.log('Socket connected successfully');
    console.log('Socket ID:', socket.id);
    socket.emit('requestGreeting', chatbotId);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error details:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected. Reason:', reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error.message);
  });

  // Update the join event to use uniqueConversationId
  socket.emit('join', uniqueConversationId);

  function addMessageToChat(message, isUser = false) {
    console.log(`Adding message to chat. Is user: ${isUser}, Message: ${message}`);
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', isUser ? 'user-message' : 'bot-message');
    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    console.log('Message added to chat container. Element:', messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Request initial greeting using uniqueConversationId
  socket.emit('requestGreeting', uniqueConversationId);
  console.log('Greeting requested for chatbot ID:', chatbotId);

  async function sendMessage(message) {
    console.log('sendMessage called with:', message);
    console.log('Current chatbotId:', chatbotId); // Added this line

    if (message) {
      // Display user's message immediately
      addMessageToChat(message, true);
      userInput.value = '';

      // Emit the user message through Socket.IO using uniqueConversationId and include chatbotId
      socket.emit('chatMessage', { conversationId: uniqueConversationId, message: message, chatbotId: chatbotId });
    }
  }

  // Listen for incoming messages
  socket.on('message', (data) => {
    console.log('Received message event:', data);
    if (!data.isUser) {
      console.log('Adding bot message to chat:', data.message);
      addMessageToChat(data.message, false);
    }
  });

  chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const message = userInput.value.trim();
    if (message) {
      console.log(`Sending message: ${message}`);
      sendMessage(message);
    }
  });

  const clearChatButton = document.getElementById('clear-chat');

  function clearChat() {
    chatContainer.innerHTML = '';
    console.log('Chat cleared');
    socket.emit('requestGreeting', chatbotId);
  }

  clearChatButton.addEventListener('click', clearChat);
});