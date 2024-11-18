const fs = require('fs');
const path = require('path');

const clients = new Map();
const games = new Map();

function getRandomName(){

    const names_file_path = path.join(__dirname, 'random_names.txt');
    const file_content = fs.readFileSync(names_file_path, 'utf8');
    const names = file_content.split('\n').map(name => name.trim()).filter(name => name)
    const random = Math.floor(Math.random() * names.length);
    return names[random];

}

function createGame(result, connection) {
    try {
        const clientID = result.clientID;
        const username = result.username;
        const gameID = getRandomName();

        const game = {
            id: gameID,
            clients: [],
            state: {},
            messageHistory: []
        };

        console.log(games)
        games.set(gameID, game);
        clients.set(clientID, { connection, username });
        console.log(games)
        const payload = {
            action: "create",
            game: {
                id: gameID,
                state: game.state
            }
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

        const existingClient = game.clients.find(c => c.clientID === clientID);
        if (existingClient) throw new Error("Client is already in the game");
        if (game.clients.length >= 2) throw new Error("Game is full");

        const paddle = game.clients.length === 0 ? "Left" : "Right";
        game.clients.push({ clientID, paddle, username });

        clients.set(clientID, { connection, username });
        console.log(clients)
        const payload = {
            action: "join",
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

        if (game.clients.length === 2) {
            updateGameState();
            // updateBallPosition(gameID);  
        }

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


            const CANVAS_HEIGHT = 400;
            const CANVAS_WIDTH = 600;

            const BALL_START_X = CANVAS_WIDTH / 2;
            const BALL_START_Y = CANVAS_HEIGHT / 2;
            const BALL_START_X_DIR = Math.random() < 0.5 ? 1 : -1;
            const BALL_START_Y_DIR = Math.random() < 0.5 ? 1 : -1;
            const BALL_SPEED = 4; // HUOM! laita parillinen luku :] muuten hajoaa

            const PADDLE_HEIGHT = 40;

            const PADDLE_WIDTH = 10; // Mailan leveys
            const PADDLE_THICKNESS = 10; // Mailan paksuus

            const BALL_RADIUS = 10; // Pallon säde

            let LEFT_PADDLE_POS_Y = 4;
            let RIGHT_PADDLE_POS_Y = 4;

            let LEFT_PADDLE_POS_X = 0;
            let RIGHT_PADDLE_POS_X = CANVAS_WIDTH - PADDLE_WIDTH;

            let SCORE = false;


            if (!game.state.ball) {
                game.state.ball = {
                    x: BALL_START_X,
                    y: BALL_START_Y,
                    dx: BALL_START_X_DIR,
                    dy: BALL_START_Y_DIR,
                    speed: BALL_SPEED,
                    radius: BALL_RADIUS
                };
            }

            // Pallon tilan päivitys
            const ball = game.state.ball;
            ball.x += ball.dx * BALL_SPEED;
            ball.y += ball.dy * BALL_SPEED;
            
            // Ylä- ja alareunoihin törmäys
            if (ball.y == 0 || ball.y == CANVAS_HEIGHT) {
                ball.dy *= -1;
            }

            // Hae kaikki state-objektin avain-arvoparit listana
            const stateEntries = Object.entries(game.state);

            // Ota viimeiset kaksi itemiä listasta
            const lastTwoEntries = stateEntries.slice(-2);

            // Hae position-arvot kummastakin itemistä
            const p1_INT = lastTwoEntries[0]?.[1]?.position || 0; // Ensimmäinen viimeisistä
            const p2_INT = lastTwoEntries[1]?.[1]?.position || 0; // Toinen viimeisistä

            //Skaalataan int positio kolladereita varten -> Näiden muuttelu pitää tehdä myös frontendissä
            LEFT_PADDLE_POS_Y = p1_INT * PADDLE_HEIGHT ;
            RIGHT_PADDLE_POS_Y = p2_INT * PADDLE_HEIGHT ;
          

            // Törmäys vasemman mailan kanssa
            if (ball.x - ball.radius <= LEFT_PADDLE_POS_X + PADDLE_WIDTH) { // Pallon vasen reuna osuu mailan oikeaan reunaan
                if (
                    ball.y + ball.radius >= LEFT_PADDLE_POS_Y && // Pallon alaosa osuu mailan yläreunaan
                    ball.y - ball.radius <= LEFT_PADDLE_POS_Y + PADDLE_HEIGHT // Pallon yläosa osuu mailan alareunaan
                ) {
                    // console.log(
                    //     "Left paddle hit: Ball " +
                    //     ball.x +
                    //     " " +
                    //     ball.y +
                    //     " Paddle Left " +
                    //     LEFT_PADDLE_POS_X +
                    //     " " +
                    //     LEFT_PADDLE_POS_Y
                    // );
                    
                     // Lasketaan osumakohdan suhteellinen sijainti mailan korkeuteen
                     const relativeIntersectY = (ball.y - LEFT_PADDLE_POS_Y) / PADDLE_HEIGHT;

                     // Asetetaan uusi suunta suhteessa osumakohtaan
                     const normalizedIntersectY = 2 * relativeIntersectY - 1; // Skaalataan -1 (yläosa) ja 1 (alaosa) välillä
                     ball.dy = normalizedIntersectY * Math.abs(ball.dx); // Suunta Y-akselilla suhteessa X-akselin nopeuteen
 


                    ball.dx = -ball.dx; // Käännä pallon X-akselin liikesuunta
                    SCORE = false;
                } else {
                    SCORE = true; // Pallo ohittaa mailan
                }
            }

             // Ylä- ja alareunoihin törmäys
             if (ball.y == 0 || ball.y == CANVAS_HEIGHT) {
                ball.dy *= -1;
            }

          
            // Törmäys oikean mailan kanssa
            if (ball.x + ball.radius >= RIGHT_PADDLE_POS_X) { // Pallon oikea reuna osuu mailan vasempaan reunaan
                if (
                    ball.y + ball.radius >= RIGHT_PADDLE_POS_Y && // Pallon alaosa osuu mailan yläreunaan
                    ball.y - ball.radius <= RIGHT_PADDLE_POS_Y + PADDLE_HEIGHT // Pallon yläosa osuu mailan alareunaan
                ) {
                    // console.log(
                    //     "Right paddle hit: Ball " +
                    //     ball.x +
                    //     " " +
                    //     ball.y +
                    //     " Paddle Right " +
                    //     RIGHT_PADDLE_POS_X +
                    //     " " +
                    //     RIGHT_PADDLE_POS_Y
                    // );

                    // Lasketaan osumakohdan suhteellinen sijainti mailan korkeuteen
                    const relativeIntersectY = (ball.y - RIGHT_PADDLE_POS_Y) / PADDLE_HEIGHT;

                    // Asetetaan uusi suunta suhteessa osumakohtaan
                    const normalizedIntersectY = 2 * relativeIntersectY - 1; // Skaalataan -1 (yläosa) ja 1 (alaosa) välillä
                    ball.dy = normalizedIntersectY * Math.abs(ball.dx); // Suunta Y-akselilla suhteessa X-akselin nopeuteen
                    
                    ball.dx = -ball.dx; // Käännä pallon X-akselin liikesuunta
            
                    SCORE = false;
                } else {
                    SCORE = true; // Pallo ohittaa mailan
                }
            }

             // Ylä- ja alareunoihin törmäys
             if (ball.y == 0 || ball.y == CANVAS_HEIGHT) {
                ball.dy *= -1;
            }

            // Maali, pallo palaa keskelle
            if (SCORE) {
                // console.log("SCORE!!!");
                ball.x = BALL_START_X;
                ball.y = BALL_START_Y;
                ball.dx = BALL_START_X_DIR;
                ball.dy = BALL_START_Y_DIR;
                SCORE = false;
            }

              // Lisää mailojen tiedot game.state tilaan
              game.state.paddles = {
                left: {
                    x: LEFT_PADDLE_POS_X,
                    y: LEFT_PADDLE_POS_Y, 
                    width: PADDLE_WIDTH,
                    height: PADDLE_HEIGHT,
                    thickness: PADDLE_THICKNESS
                },
                right: {
                    x: RIGHT_PADDLE_POS_X,
                    y: RIGHT_PADDLE_POS_Y,
                    width: PADDLE_WIDTH,
                    height: PADDLE_HEIGHT,
                    thickness: PADDLE_THICKNESS
                }
            };

             // Pelikanvasin tiedot
             game.state.canvas = {
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT
            };
            

            const gameState = {
                id: game.id,
                clients: game.clients,
                state: game.state,
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
        setTimeout(updateGameState, 20);
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

            console.log(`Message received from player ${clientID} for game ${gameID}: ${content}`);

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

        // Initialize client state if not already set
        if (!game.state[clientID]) {
            game.state[clientID] = { position: 4 }; // Default position is the middle
        }

        // Adjust paddle position based on direction
        if (direction === 'up') {
            game.state[clientID].position = Math.min(game.state[clientID].position + 1, 9);
        } else if (direction === 'down') {
            game.state[clientID].position = Math.max(game.state[clientID].position - 1, 0);
        } else {
            throw new Error("Invalid direction for paddle movement");
        }

        console.log(`Player ${clientID} moved ${direction}. New position: ${game.state[clientID].position}`);

        // Prepare payload to update all clients
        const payload = {
            action: "update",
            game: {
                id: gameID,
                clients: game.clients,
                state: game.state
            }
        };

        // Notify all clients in the game about the updated state
        game.clients.forEach(c => {
            const clientConnection = clients.get(c.clientID).connection;
            if (clientConnection && clientConnection.connected) {
                clientConnection.send(JSON.stringify(payload));
            }
        });
    } catch (error) {
        console.error('Error moving paddle:', error.message);

        const clientConnection = clients.get(result.clientID)?.connection;
        if (clientConnection) {
            clientConnection.send(JSON.stringify({
                action: "error",
                message: error.message
            }));
        }
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
    games,
};