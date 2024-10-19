// websocket.js
const { v4: uuidv4 } = require('uuid');
const serverHelper = require('./utils/serverHelper');

function setupWebSocketServer(pongWS) {
    pongWS.on('request', request => {
        const connection = request.accept(null, request.origin);
        console.log('New connection:', connection.socket.remoteAddress);

        const clientID = uuidv4();
        serverHelper.clients.set(clientID, { connection });

        const payload = {
            action: "connect",
            clientID: clientID
        };
        connection.send(JSON.stringify(payload));

        connection.on('message', message => handleMessage(message, connection));
        connection.on('close', () => handleDisconnection(clientID));
        connection.on('error', (error) => handleError(connection, error));
    });
}

function handleMessage(message, connection) {
    try {
        const result = JSON.parse(message.utf8Data);
        console.log('Received message:', result);

        if (!result.action || !result.clientID) {
            throw new Error("Invalid request: Missing action or client ID");
        }

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
        connection.send(JSON.stringify({
            action: "error",
            message: "Invalid message format or unknown action"
        }));
    }
}

function handleDisconnection(clientID) {
    console.log('Client disconnected:', clientID);

    serverHelper.games.forEach((game, gameID) => {
        game.clients = game.clients.filter(c => c.clientID !== clientID);
        if (game.clients.length === 0) {
            console.log(`Removing empty game: ${gameID}`);
            serverHelper.games.delete(gameID);
        }
    });

    serverHelper.clients.delete(clientID);
}

function handleError(connection, error) {
    console.error('WebSocket Error:', error.message);
    connection.send(JSON.stringify({
        action: "error",
        message: "WEBSOCKET ERROR: Please debug the issue!"
    }));
}

module.exports = { setupWebSocketServer };
