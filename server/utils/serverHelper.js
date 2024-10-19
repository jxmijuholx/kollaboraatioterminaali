const { v4: uuidv4 } = require('uuid');

const clients = new Map();
const games = new Map();

function createGame(result, connection) {
    try {
        const clientID = result.clientID;
        const gameID = uuidv4();

        const game = {
            id: gameID,
            clients: [],
            state: {},
            messageHistory: []
        };

        games.set(gameID, game);

        clients.set(clientID, { connection });

        const payload = {
            action: "create",
            game: game
        };

        connection.send(JSON.stringify(payload));
        console.log(`Game created with ID: ${gameID}`);
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
        const gameID = result.gameID;

        // Check if the game exists
        const game = games.get(gameID);
        if (!game) {
            throw new Error("Game not found");
        }

        // Check if the game is full
        if (game.clients.length >= 2) {
            throw new Error("Game is full");
        }

        // Assign paddle to the client
        const paddle = game.clients.length === 0 ? "Left" : "Right";
        game.clients.push({
            clientID: clientID,
            paddle: paddle
        });

        clients.set(clientID, { connection });

        const payload = {
            action: "join",
            game: game
        };

        game.clients.forEach(c => {
            const clientConnection = clients.get(c.clientID).connection;
            if (clientConnection && clientConnection.connected) {
                clientConnection.send(JSON.stringify(payload));
            }
        });

        if (game.clients.length === 2) {
            updateGameState();
        }

        console.log(`Client ${clientID} joined game ${gameID}`);
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

        if (!gameID || !paddleID || !side) {
            throw new Error("Missing game ID, paddle ID, or side");
        }

        const game = games.get(gameID);
        if (!game) {
            throw new Error("Game not found");
        }

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

        if (!gameID || !clientID) {
            throw new Error("Missing game ID or client ID.");
        }

        const game = games.get(gameID);
        if (!game) {
            throw new Error("Game not found");
        }

        if (action === 'sendmessage') {
            if (!content) {
                throw new Error("Message content is missing");
            }

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

        if (!gameID || !clientID) {
            throw new Error("Missing game ID or client ID");
        }

        const game = games.get(gameID);
        if (!game) {
            throw new Error("Game not found");
        }

        // mailojen lokaatio alussa
        game.state[clientID] = game.state[clientID] || { position: 0 };

        // päivitetään sijainti
        if (direction === 'up') {
            game.state[clientID].position = Math.max(game.state[clientID].position - 1, -8); // cap at -8
        } else if (direction === 'down') {
            game.state[clientID].position = Math.min(game.state[clientID].position + 1, 8); // cap at 8
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

        // Notify all clients of the updated game state
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


module.exports = { createGame, joinGame, playGame, handleMessages, movePaddle, clients, games };
