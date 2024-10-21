require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db');
const authRoutes = require('./routes/authRoute');
const http = require('http');
const WebSocketServer = require('websocket').server;
const { setupWebSocketServer } = require('./websocket');
const cors = require('cors');

const app = express();
connectDB();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Tervetuloa pong game API:in!');
});

const httpServer = http.createServer(app);

httpServer.listen(8080, () => {
    console.log('Server listening on port 8080');
});

const pongWS = new WebSocketServer({
    httpServer: httpServer
});

setupWebSocketServer(pongWS);
