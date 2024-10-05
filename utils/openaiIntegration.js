const OpenAI = require("openai");

async function isApiKeyValid(apiKey) {
  console.log('Validating API key (first 4 characters):', apiKey.substring(0, 4));
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    // Use a simple API call to check if the key is valid
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    });
    console.log('API key validation successful. Response:', response);
    return true;
  } catch (error) {
    console.error('Error checking OpenAI API key:', error.message);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return false;
  }
}

async function createChatCompletion(messages, apiKey) {
  console.log('Creating chat completion with API Key (first 4 characters):', apiKey.substring(0, 4));
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    console.log("OpenAI completion generated successfully.");
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error.message, error.stack);
    return "I'm sorry, but I encountered an error while processing your request.";
  }
}

module.exports = { createChatCompletion, isApiKeyValid };