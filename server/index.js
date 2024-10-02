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
const clients = new Map();
// HashMaps for games AKA ROOMS IN SERVER
const games = new Map();

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
                case 'move':
                    movePaddle(result);
                    break;
                case 'sendmessage': //Terminaalin sendMessagefunktio mätsää tähän
                    handleMessages(result);
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

            //Lisäys tähän functioon, muuten sama
            // Luodaan uusi objekti, joka sisältää vain tarvittavat tiedot -> tällä sain lisättyä viestit mukaan ettei tämä looppi katkea kun laitetaan viestiä
            const gameState = {
                id: game.id,
                clients: game.clients,
                state: game.state
            };
            // 

            const payload = {
                "action": "update",
                "game": gameState
            };

            game.clients.forEach(c => {
                clients[c.clientID].connection.send(JSON.stringify(payload));
            });
        }
        setTimeout(updateGameState, 50);
    } catch (error) {
        console.error('Pelin tilan päivittäminen ei onnannu :/:', error.message);
    }
}

//Funktio viestin lähettämiselle ja vastaan ottamiselle -> alkaa kun toinen lähettää viestin ja välittää toiselle 
function handleMessages(result) {
    try {
        const gameID = result.gameID;
        const clientID = result.clientID;

        if (!gameID || !clientID) {
            throw new Error("Puuttuu joko peli id tai client id.");
        }

        const game = games[gameID];
        if (!game) {
            throw new Error("Peliä ei löytynyt");
        }

        if (result.action === 'sendmessage') {
            const content = result.content;

            if (!content) {
                throw new Error("Viestin sisältö puuttuu??.");
            }

            const message = {
                action: 'message',
                from: clientID,
                content: content
            };

            // Tallennetaan viesti pelin viestihistoriaan -> katsotaan onko mitään hyötyä vai tuleeko ongelmia tilan kanssa
            game.messageHistory = game.messageHistory || [];
            game.messageHistory.push(message);

            // Lähetetään viesti kaikille pelin pelaajille -> Terminaalielementissä manusti poistettu "oma viesti" eli terminaali ei nyt hae
            game.clients.forEach(c => {
                if (clients[c.clientID] && clients[c.clientID].connection) {
                    clients[c.clientID].connection.send(JSON.stringify(message));
                }
            });

            console.log(`Lähetetetyn viestin sisältö, tulee molemmille: ${content}`);

        }
        //Ei ollut turhaposita...lol
        else if (result.action === "getmessages") {
            const messageHistory = game.messageHistory || [];
            const payload = {
                action: 'getmessages',
                from: clientID,
                messages: messageHistory
            };
            clients[clientID].connection.send(JSON.stringify(payload));
            console.log(`historiasta peli ${gameID} pelaajalle ${clientID}, homma toimii`);
        }

    } catch (error) {
        console.error('Viestien käsittelyssä tapahtui virhe:', error.message);
    }
}

// Funktio mailan liikuttamiselle -> tarkistaa pelin ja pelaajan tilan ja liikuttaa mailaa ja lähettää mailan position kaikille pelaajille samassa pelissä
function movePaddle(result) {
    const { gameID, clientID, direction } = result;

    if (!gameID || !clientID) {
        throw new Error("Puuttuu joko peli id tai client id.");
    }

    const game = games[gameID];
    if (!game) {
        throw new Error("Peliä ei löytynyt");
    }

    game.state = game.state || {};
    game.state[clientID] = game.state[clientID] || { position: 0 };

    if (direction === 'up') {
        game.state[clientID].position -= 1;
    } else if (direction === 'down') {
        game.state[clientID].position += 1;
    } else {
        throw new Error("ei voi tietää suunnasta bro");
    }

    console.log(`Player ${clientID} moved ${direction}. New position: ${game.state[clientID].position}`);

    // broadcastaa pelin tila kaikille pelaajille
    const payload = {
        "action": "update",
        "game": {
            id: gameID,
            clients: game.clients,
            state: game.state
        }
    }

    game.clients.forEach(c => {
        if (clients[c.clientID] && clients[c.clientID].connection) {
            clients[c.clientID].connection.send(JSON.stringify(payload));
        }
    })
    if (error) {
        console.error('Virhe mailan liikuttamisessa:', error.message);
        throw new Error("Virhe mailan liikuttamisessa");
    }
}
