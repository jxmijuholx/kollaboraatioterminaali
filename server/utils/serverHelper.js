const { v4: uuidv4 } = require('uuid');

const clients = new Map();
const games = new Map();

function createGame(result, connection) {
    try {
        const clientID = result.clientID;
        const username = result.username;
        const gameID = uuidv4();

        const game = {
            id: gameID,
            clients: [{ clientID, username }],
            state: {},
            messageHistory: []
        };

        games.set(gameID, game);
        clients.set(clientID, { connection, username });

        const payload = {
            action: "create",
            game
        };

        connection.send(JSON.stringify(payload));
        console.log(`Game created with ID: ${gameID} by user: ${username}`);
    } catch (error) {
        console.error('Error creating game:', error.message);
        connection.send(JSON.stringify({
            action: "error",
            message: "Failed to create the game"
        }));
    }
}

function joinGame(result, connection) {
    try {
        const clientID = result.clientID;
        const username = result.username;
        const gameID = result.gameID;

        const game = games.get(gameID);
        if (!game) throw new Error("Game not found");
        if (game.clients.length >= 2) throw new Error("Game is full");

        const paddle = game.clients.length === 0 ? "Left" : "Right";
        game.clients.push({ clientID, paddle, username });

        clients.set(clientID, { connection, username });

        const payload = {
            action: "join",
            game
        };

        game.clients.forEach(c => {
            const clientConnection = clients.get(c.clientID).connection;
            if (clientConnection && clientConnection.connected) {
                clientConnection.send(JSON.stringify(payload));
            }
        });

        if (game.clients.length === 2) updateGameState();

        console.log(`Client ${clientID} (${username}) joined game ${gameID}`);
    } catch (error) {
        console.error('Error joining game:', error.message);
        connection.send(JSON.stringify({
            action: "error",
            message: error.message
        }));
    }
}

function playGame(result) {
    try {
        const { gameID, paddleID, side } = result;

        if (!gameID || !paddleID || !side) throw new Error("Missing game ID, paddle ID, or side");

        const game = games.get(gameID);
        if (!game) throw new Error("Game not found");

        game.state[paddleID] = side;

        console.log(`Game state updated for game ${gameID}:`, game.state);
    } catch (error) {
        console.error('Error in playGame function:', error.message);
    }
}

function updateGameState() {
    try {
        games.forEach((game, gameID) => {
            const gameState = {
                id: game.id,
                clients: game.clients,
                state: game.state
            };

            const payload = {
                action: "update",
                game: gameState
            };

            game.clients.forEach(c => {
                const clientConnection = clients.get(c.clientID).connection;
                if (clientConnection && clientConnection.connected) {
                    clientConnection.send(JSON.stringify(payload));
                }
            });
        });
        setTimeout(updateGameState, 100);
    } catch (error) {
        console.error('Error updating game state:', error.message);
    }
}

function handleMessages(result) {
    try {
        const { gameID, clientID, action, content, username } = result;

        if (!gameID || !clientID) throw new Error("Missing game ID or client ID.");

        const game = games.get(gameID);
        if (!game) throw new Error("Game not found");

        if (action === 'sendmessage') {
            if (!content) throw new Error("Message content is missing");

            const message = {
                action: 'message',
                from: clientID,
                content: content,
                username: username
            };

            game.messageHistory.push(message);

            game.clients.forEach(c => {
                const clientConnection = clients.get(c.clientID).connection;
                if (clientConnection && clientConnection.connected) {
                    clientConnection.send(JSON.stringify(message));
                }
            });

            console.log(`Message sent: ${content}`);
        } else if (action === "getmessages") {
            const messageHistory = game.messageHistory || [];
            const payload = {
                action: 'getmessages',
                from: clientID,
                messages: messageHistory
            };

            clients.get(clientID).connection.send(JSON.stringify(payload));
            console.log(`Message history sent to player ${clientID} for game ${gameID}`);
        }
    } catch (error) {
        console.error('Error handling messages:', error.message);
    }
}

function movePaddle(result) {
    try {
        const { gameID, clientID, direction } = result;

        if (!gameID || !clientID) throw new Error("Missing game ID or client ID");

        const game = games.get(gameID);
        if (!game) throw new Error("Game not found");

        game.state[clientID] = game.state[clientID] || { position: 0 };

        if (direction === 'up') {
            game.state[clientID].position -= 1;
        } else if (direction === 'down') {
            game.state[clientID].position += 1;
        } else {
            throw new Error("Unknown direction");
        }

        console.log(`Player ${clientID} moved ${direction}. New position: ${game.state[clientID].position}`);

        const payload = {
            action: "update",
            game: {
                id: gameID,
                clients: game.clients,
                state: game.state
            }
        };

        game.clients.forEach(c => {
            const clientConnection = clients.get(c.clientID).connection;
            if (clientConnection && clientConnection.connected) {
                clientConnection.send(JSON.stringify(payload));
            }
        });
    } catch (error) {
        console.error('Error moving paddle:', error.message);
        throw new Error("Error moving paddle");
    }
}

function cleanupEmptyGames(clientID) {
    games.forEach((game, gameID) => {
        game.clients = game.clients.filter(c => c.clientID !== clientID);
        if (game.clients.length === 0) {
            console.log(`Removing empty game: ${gameID}`);
            games.delete(gameID);
        }
    });
    clients.delete(clientID);
}

module.exports = {
    createGame,
    joinGame,
    playGame,
    handleMessages,
    movePaddle,
    updateGameState,
    cleanupEmptyGames,
    clients,
    games
};
