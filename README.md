# Pythagora Chatbots

Pythagora Chatbots is an online platform designed to help users create, customize, and deploy LLM-based support chatbots. These chatbots can be tailored with unique personalities, cultures, names, and interactive chat widgets. The chatbots can be integrated into client websites to offer instant responses, suggestions, and task completions based on user queries.

## Overview

Pythagora Chatbots is built using a modern web application stack, leveraging the following technologies:
- **Node.js** and **Express** for the backend server.
- **MongoDB** with **Mongoose** ORM for data storage.
- **EJS** for templating.
- **Vanilla JavaScript** and **Bootstrap** for the frontend.
- **Socket.IO** for real-time chat functionality.
- **OpenAI API** for dynamic conversation handling.

The project structure includes:
- **Models**: Mongoose schemas for Chatbot and User.
- **Routes**: Express routes for authentication, dashboard, API, deployment, profile management, and chatbot customization.
- **Views**: EJS templates for various pages including login, register, dashboard, profile, chatbot customization, testing, and deployment.
- **Public**: Static assets including CSS and JS files.
- **Utils**: Utility functions for chatbot logic and OpenAI integration.

## Features

1. **User Registration and Authentication**: Users can register with an email and username, and log in using either email or username to access the application.
2. **Chatbot Customization Interface**: Users can customize their chatbot's name, personality, responses, appearance, culture-specific behaviors, detailed context, initial greeting, farewell messages, theme colors, and on-site placement.
3. **Chatbot Testing Environment**: A simple interface for users to test chatbot responses before deployment.
4. **Chatbot Deployment**: Users can deploy chatbots to their websites using a provided script tag, customizable for bottom-left or bottom-right placement. The script tag includes a 'Chat' floating icon for real-time chat functionality.
5. **Theme Customization**: Users can set chatbot theme colors to match their website.
6. **Dynamic Conversation with OpenAI LLM**: The chatbot dynamically interacts with users by sending messages to OpenAI's LLM using the user's own OpenAI API key.

## Getting started

### Requirements

To run this project, you need:
- **Node.js** - JavaScript runtime
- **MongoDB** - NoSQL database (local or cloud version like MongoDB Atlas)

### Quickstart

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd pythagora-chatbots
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the project root based on the `.env.example` template.
   - Add your MongoDB connection string, session secret, and other necessary environment variables.

4. **Run the application**:
   ```sh
   npm start
   ```

5. **Access the application**:
   Open your web browser and navigate to `http://localhost:3000`.

### License

The project is open source, licensed under the MIT License. See the [LICENSE](LICENSE).

Copyright © 2024 Pythagora-io.
