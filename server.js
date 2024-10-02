// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const apiRoutes = require('./routes/apiRoutes');
const deploymentRoutes = require('./routes/deploymentRoutes');
require('./models/Chatbot');
const path = require('path');
const User = require('./models/User'); // Added for socket authentication
const cors = require('cors');
const { generateResponse } = require('./utils/chatbotLogic'); // Import generateResponse

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: '*', // This allows all origins. In production, you should specify allowed origins.
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");

app.use(express.static("public"));
console.log('Static file serving set up for directory:', path.join(__dirname, 'public'));

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

app.use((req, res, next) => {
  const sess = req.session;
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

app.use(authRoutes);
app.use(dashboardRoutes);
app.use('/api', apiRoutes);
app.use(deploymentRoutes);

app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions
});

const conversationHistories = new Map();

io.use((socket, next) => {
  const apiKey = socket.handshake.query.apiKey;
  const chatbotId = socket.handshake.query.chatbotId;

  console.log('Socket authentication attempt:', { apiKey, chatbotId });

  if (!apiKey || !chatbotId) {
    console.error('Authentication failed: Missing apiKey or chatbotId');
    return next(new Error('Authentication error'));
  }

  User.findOne({ apiKey: apiKey })
    .then(user => {
      if (!user) {
        console.error('Authentication failed: Invalid apiKey');
        return next(new Error('Authentication error'));
      }
      console.log('User found for authentication:', user._id);
      socket.user = user;
      socket.chatbotId = chatbotId;
      next();
    })
    .catch(err => {
      console.error('Socket authentication error:', err);
      next(new Error('Authentication error'));
    });
});

io.on('connection', (socket) => {
  console.log('New Socket.IO connection established. Socket ID:', socket.id);
  console.log('User:', socket.user._id, 'Chatbot ID:', socket.chatbotId);

  // Generate a unique conversation ID for this connection
  const conversationId = `${socket.chatbotId}-${socket.id}`;

  socket.on('join', (chatbotId) => {
    console.log(`Socket ${socket.id} joined conversationId: ${conversationId}`);
    socket.join(conversationId);
  });

  socket.on('requestGreeting', async (chatbotId) => {
    console.log(`Received requestGreeting event for chatbotId: ${chatbotId}`);
    try {
      const chatbot = await mongoose.model('Chatbot').findOne({ uniqueId: chatbotId, user: socket.user._id });
      if (chatbot) {
        const greeting = chatbot.greeting || 'Hello! How can I assist you today?';
        console.log(`Sending greeting message: "${greeting}" to conversationId: ${conversationId}`);
        io.to(conversationId).emit('message', { isUser: false, message: greeting });
      } else {
        console.log(`Chatbot not found for chatbotId: ${chatbotId}`);
      }
    } catch (error) {
      console.error('Error sending greeting:', error);
      console.error(error.stack);
    }
  });

  socket.on('chatMessage', async (data) => {
    console.log('Received chat message. Socket ID:', socket.id, 'Chatbot ID:', data.chatbotId, 'Message:', data.message);

    // Get or create conversation history for this specific conversation
    const conversationId = `${data.chatbotId}-${socket.id}`;
    if (!conversationHistories.has(conversationId)) {
      conversationHistories.set(conversationId, []);
    }
    const conversationHistory = conversationHistories.get(conversationId);

    console.log('Current conversation history:', conversationHistory);

    try {
      const chatbot = await mongoose.model('Chatbot').findOne({ uniqueId: data.chatbotId, user: socket.user._id });
      if (chatbot) {
        // Add user message to conversation history
        conversationHistory.push({ role: 'user', content: data.message });

        const botResponse = await generateResponse(chatbot, data.message, conversationHistory);

        // Add bot response to conversation history
        conversationHistory.push({ role: 'assistant', content: botResponse });

        io.to(conversationId).emit('message', { isUser: false, message: botResponse });
        console.log(`Response sent to conversationId: ${conversationId}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      console.error(error.stack);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected. Socket ID:', socket.id);
  });
});

const chatbotRoutes = require('./routes/chatbotRoutes')(io);
console.log('Chatbot routes initialized');

app.use('/chatbot', chatbotRoutes);
console.log('Chatbot routes registered');

app.get("/", (req, res) => {
  res.render("index");
});

app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`Registered route: ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach((nestedRoute) => {
      if (nestedRoute.route && nestedRoute.route.path) {
        console.log(`Registered nested route: ${r.regexp.source.replace("\\/", "/").replace("/?", "")}${nestedRoute.route.path}`);
      }
    });
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});