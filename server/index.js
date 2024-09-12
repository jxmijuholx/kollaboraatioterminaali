const { v4: uuidv4 } = require('uuid');
const http = require('http');
const app = require('express')();

app.listen(6969, () => console.log('Servu kuuntelee porttii 6969'));
const webSocketServer = require('websocket').server;
const httpServer = http.createServer();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

httpServer.listen(8080, () => {
    console.log('Servu kuuntelee porttii  8080');
});

// HashMaps for clients AKA PLAYERS IN SERVER
const clients = {};
// HashMaps for games AKA ROOMS IN SERVER
const games = {};

const pongWS = new webSocketServer({
    "httpServer": httpServer
});

pongWS.on('request', request => {
    const connection = request.accept(null, request.origin);

    // Error handling for WebSocket connection issues
    connection.on('error', (error) => {
        console.error('WebSocket Error:', error.message);
        connection.send(JSON.stringify({
            "action": "error",
            "message": "WEBSOCKET ERROR NYT DEBUGGAAMAAAAAN"
        }));
    });

    connection.on('message', message => {
        try {
            const result = JSON.parse(message.utf8Data);
            console.log('Received message:', result);

            if (!result.action || !result.clientID) {
                throw new Error("bor requestist puuttuu action tai client id");
            }

            switch (result.action) {
                case 'create':
                    createGame(result, connection);
                    break;
                case 'join':
                    joinGame(result, connection);
                    break;
                case 'play':
                    playGame(result);
                    break;
                default:
                    throw new Error("En tajunnu tätä: " + result.action);
            }
        } catch (err) {
            console.error('Error processing message:', err.message);
            connection.send(JSON.stringify({
                "action": "error",
                "message": "Invalid message format or unknown action or something"
            }));
        }
    });

    const clientID = uuidv4();
    clients[clientID] = {
        connection: connection
    };

    const payload = {
        "action": "connect",
        "clientID": clientID
    };

    connection.send(JSON.stringify(payload));

    connection.on('close', () => {
        console.log('Yhteys suljettu by client:', clientID);

        // Clean up client and games on disconnection
        Object.keys(games).forEach(gameID => {
            const game = games[gameID];
            game.clients = game.clients.filter(c => c.clientID !== clientID);

            // If no clients remain, delete the game
            if (game.clients.length === 0) {
                console.log(`Poistetaan tyhkä peli: ${gameID}`);
                delete games[gameID];
            }
        });

        delete clients[clientID];
    });
});

// Helper functions for handling different actions

function createGame(result, connection) {
    try {
        const clientID = result.clientID;
        const gameID = uuidv4();

        games[gameID] = {
            id: gameID,
            clients: []
        };

        clients[clientID] = { connection: connection }; // Varmistaa et client on lisätty yhteyteen

        const payload = {
            "action": "create",
            "game": games[gameID]
        };

        connection.send(JSON.stringify(payload));
        console.log(`Peli luotu ID:llä: ${gameID}`);
    } catch (error) {
        console.error('Error pelin luonnissa:', error.message);
        connection.send(JSON.stringify({
            "action": "error",
            "message": "Ei pygenny luomaa pelii"
        }));
    }
}

function joinGame(result, connection) {
    try {
        const clientID = result.clientID;
        const gameID = result.gameID;

        // Check if game exists
        const game = games[gameID];
        if (!game) {
            throw new Error("Pelii ei löytyny");
        }

        // Check if game is full
        if (game.clients.length >= 2) {
            throw new Error("Peli on täynnä");
        }

        // Assign paddle side
        const paddle = game.clients.length === 0 ? "Left" : "Right";
        game.clients.push({
            clientID: clientID,
            paddle: paddle
        });

        // Add the client connection
        clients[clientID] = { connection: connection };

        // Broadcast the updated game to both players
        const payload = {
            "action": "join",
            "game": game
        };

        game.clients.forEach(c => {
            clients[c.clientID].connection.send(JSON.stringify(payload));
        });

        if (game.clients.length === 2) {
            updateGameState();
        }

        console.log(`Client ${clientID} joined game ${gameID}`);
    } catch (error) {
        console.error('Error joining game:', error.message);
        connection.send(JSON.stringify({
            "action": "error",
            "message": error.message
        }));
    }
}

function playGame(result) {
    try {
        const gameID = result.gameID;
        const paddleID = result.paddleID;
        const side = result.side;

        if (!gameID || !paddleID || !side) {
            throw new Error("joko puuttuu a) peli id b) mailan id tai c) pelaajan puoli");
        }

        const game = games[gameID];
        if (!game) {
            throw new Error("Peliiiii ei ooooooo");
        }

        let state = game.state || {};
        state[paddleID] = side;
        game.state = state;

        console.log(`Pelin tila päivitetty statseilla ${gameID}:`, state);
    } catch (error) {
        console.error('joku error funktios playGame:', error.message);
    }
}

// Function to update game state periodically
function updateGameState() {
    try {
        for (const gameID of Object.keys(games)) {
            const game = games[gameID];
            const payload = {
                "action": "update",
                "game": game
            };

            game.clients.forEach(c => {
                clients[c.clientID].connection.send(JSON.stringify(payload));
            });
        }
        setTimeout(updateGameState, 500);
    } catch (error) {
        console.error('Pelin tilan päivittäminen ei onnannu :/:', error.message);
    }
}
