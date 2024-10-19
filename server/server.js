const express = require('express');
const http = require('http');
const WebSocketServer = require('websocket').server;
const { setupWebSocketServer } = require('./websocket');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const httpServer = http.createServer(app);

httpServer.listen(8080, () => {
    console.log('Server listening on port 8080');
});

const pongWS = new WebSocketServer({
    httpServer: httpServer
});

setupWebSocketServer(pongWS);
