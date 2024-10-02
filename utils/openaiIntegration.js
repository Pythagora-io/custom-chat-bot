const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createChatCompletion(messages) {
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

module.exports = { createChatCompletion };