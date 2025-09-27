// server/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');


// Import models needed for Socket.IO message handling
const Message = require('./models/Message');
const StudyGroup = require('./models/StudyGroup');
const User = require('./models/User');
const legalRoutes = require('./routes/legalRoutes');


const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors()); // This is for standard API requests

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[REQUEST LOG] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, '../client/public')));
app.use('/api/pre-gen-course', require('./routes/preGenCourse'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/course', require('./routes/course'));
app.use('/api/studygroup', require('./routes/studyGroup'));
app.use('/api/message', require('./routes/message'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pre-gen-category', require('./routes/preGenCategory'));
app.use('/api/public-pre-gen-courses', require('./routes/publicPreGenCourse'));


app.get('/', (req, res) => res.send('API Running'));
app.use('/api/knowledgebase/category', require('./routes/knowledgebaseCategory'));
app.use('/api/knowledgebase/article', require('./routes/knowledgebaseArticle'));
app.use('/api/public/kb', require('./routes/publicKnowledgebase'));
app.use('/api/blogs/category', require('./routes/blogCategory'));
app.use('/api/blogs/article', require('./routes/blog'));
app.use('/api/support/category', require('./routes/supportTicketCategory'));
app.use('/api/team/department', require('./routes/department'));
app.use('/api/team/designation', require('./routes/designation'));
app.use('/api/public/support', require('./routes/publicSupportTicket'));
app.use('/api/admin/support', require('./routes/adminSupport'));
app.use('/api/public/knowledgebase', require('./routes/publicKnowledgebase'));
app.use('/api/public/blogs', require('./routes/publicBlog'));
app.use('/api/legal', legalRoutes);
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

app.use('/api/webhooks', require('./routes/webhookRoutes'));



const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// --- THIS IS THE FIX: Correct Socket.IO Initialization with CORS ---
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000", // The origin of your React app
        methods: ["GET", "POST"], // Allowed HTTP methods
    },
});

io.on('connection', (socket) => {
    console.log('A user connected to Socket.IO');

    socket.on('setup', (userData) => {
        socket.join(userData.id);
        console.log(`User with ID ${userData.id} has set up their socket room.`);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('new message', async (newMessageData) => {
        let studyGroup = newMessageData.studyGroup;

        if (!studyGroup || !studyGroup.users) return console.log('Error: studyGroup.users not defined');

        try {
            var message = await Message.create({
                sender: newMessageData.sender._id,
                content: newMessageData.content,
                studyGroup: studyGroup._id,
            });

            message = await message.populate('sender', 'firstName lastName');
            message = await message.populate('studyGroup');
            message = await User.populate(message, {
                path: 'studyGroup.users',
                select: 'firstName lastName email',
            });

            await StudyGroup.findByIdAndUpdate(studyGroup._id, { latestMessage: message });

            studyGroup.users.forEach((user) => {
                socket.in(user._id).emit('message received', message);
            });

        } catch (error) {
            console.error("Error handling new message:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

