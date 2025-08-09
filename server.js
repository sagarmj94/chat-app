require('dotenv').config();
const app = require('./src/app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const generateResponse = require('./src/service/ai.service');
const { text } = require('body-parser');

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const chatHistory = [];
console.log("chat history", chatHistory);
io.on("connection", (socket) => {
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
    socket.on('ai-message', async (data) => {
        chatHistory.push({
            role: "user",
            parts: [{
                text: data.prompt
            }],
        });
        const response = await generateResponse(chatHistory);
        chatHistory.push({
            role: "model",
            parts: [{ text: response }]
        });
        socket.emit('ai-response', response);
        console.log(response)


        socket.emit('ai-message-response', { response });


    });

});


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});