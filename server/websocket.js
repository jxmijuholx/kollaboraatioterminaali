const { v4: uuidv4 } = require('uuid');
const serverHelper = require('./utils/serverHelper');
const { verifyToken } = require('./auth');
const User = require('./models/user');

function setupWebSocketServer(pongWS) {
    pongWS.on('request', async request => {
        // try {
        //     const token = request.httpRequest.headers['authorization']?.split(' ')[1];
        //     if (!token) {
        //         throw new Error('No token provided');
        //     }

        try {
            const url = new URL(request.httpRequest.url, `http://${request.httpRequest.headers.host}`);
            const token = url.searchParams.get('token');
            if (!token) {
                throw new Error('No token provided');
            }

            const decoded = verifyToken(token);
            const user = await User.findOne({ username: decoded.username });
            if (!user) {
                throw new Error('User not found');
            }

            const connection = request.accept(null, request.origin);
            console.log('New connection from user:', user.username);

            const clientID = user._id.toString();
            serverHelper.clients.set(clientID, { connection, username: user.username });

            const payload = {
                action: "connect",
                clientID: clientID,
                username: user.username
            };
            connection.send(JSON.stringify(payload));

            connection.on('message', message => handleMessage(message, connection, clientID, user.username));
            connection.on('close', () => handleDisconnection(clientID));
            connection.on('error', (error) => handleError(connection, error));
        } catch (error) {
            console.error('Connection error:', error.message);
            request.reject(401, 'Unauthorized');
        }
    });
}

function handleMessage(message, connection, clientID, username) {
    try {
        const result = JSON.parse(message.utf8Data);
        result.username = username;

        switch (result.action) {
            case 'create':
                serverHelper.createGame(result, connection);
                break;
            case 'join':
                serverHelper.joinGame(result, connection);
                break;
            case 'play':
                serverHelper.playGame(result);
                break;
            case 'move':
                serverHelper.movePaddle(result);
                break;
            case 'sendmessage':
                serverHelper.handleMessages(result);
                break;
            default:
                throw new Error("Unknown action: " + result.action);
        }
    } catch (err) {
        console.error('Error processing message:', err.message);
        connection.send(JSON.stringify({ action: "error", message: "Invalid message format or unknown action" }));
    }
}

function handleDisconnection(clientID) {
    console.log('Client disconnected:', clientID);
    serverHelper.clients.delete(clientID);
    serverHelper.cleanupEmptyGames(clientID);
}

function handleError(connection, error) {
    console.error('WebSocket Error:', error.message);
    connection.send(JSON.stringify({ action: "error", message: "WEBSOCKET ERROR: Please debug the issue!" }));
}

module.exports = { setupWebSocketServer };
