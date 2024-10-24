const path = require('path');
const express = require('express');
const { connectDB } = require('./db');
const authRoutes = require('./routes/authRoute');
const http = require('http');
const WebSocketServer = require('websocket').server;
const { setupWebSocketServer } = require('./websocket');
const cors = require('cors');

const app = express();

app.use(express.static(path.resolve(__dirname, 'dist')));

connectDB();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const httpServer = http.createServer(app);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

const pongWS = new WebSocketServer({
    httpServer: httpServer
});

setupWebSocketServer(pongWS);
