const { createChatCompletion } = require('./openaiIntegration');

async function generateResponse(chatbot, userMessage, conversationHistory = [], openaiApiKey) {
  console.log('Generating response for chatbot:', chatbot._id);
  console.log('Chatbot details:', JSON.stringify({
    name: chatbot.name,
    uniqueId: chatbot.uniqueId,
    personalityTraits: chatbot.personalityTraits,
    responsePattern: chatbot.responsePattern,
    country: chatbot.country
  }));
  console.log('User message:', userMessage);
  console.log('Conversation history:', conversationHistory);

  if (!openaiApiKey) {
    console.error('OpenAI API Key is missing');
    return "I'm sorry, there's an issue with my configuration. Please contact support.";
  }

  console.log('OpenAI API Key (first 4 characters):', openaiApiKey.substring(0, 4));

  if (!userMessage.trim()) {
    console.log('Empty message detected, using greeting:', chatbot.greeting);
    return chatbot.greeting || 'Hello! How can I assist you today?';
  }

  try {
    const systemMessage = `You are a chatbot with the following characteristics:
    Name: ${chatbot.name}
    Personality: ${chatbot.personalityTraits.join(', ')}
    Response Pattern: ${chatbot.responsePattern}
    Country: ${chatbot.country}

    Context:
    ${chatbot.contextQuestions.map(q => `${q.question}: ${q.answer}`).join('\n')}

    Please respond to the user's message in a way that reflects these characteristics.`;

    const messages = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await createChatCompletion(messages, openaiApiKey);

    console.log('Generated response:', response);

    if (userMessage.toLowerCase().includes('bye') || userMessage.toLowerCase().includes('goodbye')) {
      console.log('Farewell message detected, using customized farewell:', chatbot.farewell);
      return `${response} ${chatbot.farewell || 'Goodbye!'}`;
    }

    return response;
  } catch (error) {
    console.error('Error generating response:', error);
    console.error(error.stack);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
}

module.exports = { generateResponse };