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
            const CANVAS_WITH = 600;

            const BALL_START_X = CANVAS_WITH / 2;
            const BALL_START_Y = CANVAS_HEIGHT / 2;
            const BALL_START_X_DIR = Math.random() < 0.5 ? 1 : -1;
            const BALL_START_Y_DIR = Math.random() < 0.5 ? 1 : -1;
            const BALL_SPEED = 4; // HUOM! laita parillinen luku :] muuten hajoaa

            const PADDLE_HEIGHT = 50;

            let LEFT_PADDLE_POS_Y = 4;
            let RIGHT_PADDLE_POS_Y = 4;

            let LEFT_PADDLE_POS_X = 0;
            let RIGHT_PADDLE_POS_X = 600;

            let SCORE = false;


            if (!game.state.ball) {
                game.state.ball = {
                    x: BALL_START_X,
                    y: BALL_START_Y,
                    dx: BALL_START_X_DIR,
                    dy: BALL_START_Y_DIR,
                    speed: BALL_SPEED
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

            // Pelaajien positioiden haku
            const playerPositionsInt = Object.entries(game.state)
                .filter(([key]) => key !== "ball")
                .map(([clientID, clientData]) => clientData.position);

            // Pelaajien positiot int arvoina 0- 8 välillä
            const p1_INT = playerPositionsInt[0] || 0;
            const p2_INT = playerPositionsInt[1] || 0;

            //Skaalataan int positio kolladereita varten -> Näiden muuttelu pitää tehdä myös frontendissä
            LEFT_PADDLE_POS_Y = p1_INT * PADDLE_HEIGHT;
            RIGHT_PADDLE_POS_Y = p2_INT * PADDLE_HEIGHT;

            // Törmäys vasemman mailan kanssa
            //Eka tarkistetaan x akseli ja sitten y akseli mailan kanssa ja mailan pituus huomioiden
            if (ball.x == LEFT_PADDLE_POS_X) {
                if (ball.y <= LEFT_PADDLE_POS_Y +PADDLE_HEIGHT && ball.y >= LEFT_PADDLE_POS_Y - PADDLE_HEIGHT ) {
                    ball.dx = -ball.dx;
                    SCORE= false;
                }else {
                    SCORE= true;
                    // console.log(ball.x + " " + ball.y+" vasenmaila "+LEFT_PADDLE_POS_X +" "+LEFT_PADDLE_POS_Y +" Oikeamaila "+RIGHT_PADDLE_POS_X +" "+RIGHT_PADDLE_POS_Y);

                }    
            }
           

            // Törmäys oikean mailan kanssa
            //Eka tarkistetaan x akseli ja sitten y akseli mailan kanssa ja mailan pituus huomioiden
            if (ball.x == RIGHT_PADDLE_POS_X) {
                if (ball.y <= RIGHT_PADDLE_POS_Y +PADDLE_HEIGHT && ball.y >= RIGHT_PADDLE_POS_Y - PADDLE_HEIGHT) {
                    ball.dx = -ball.dx;
                    SCORE= false;
                }else {
                    SCORE= true;
                    // console.log(ball.x + " " + ball.y+" vasenmaila "+LEFT_PADDLE_POS_X +" "+LEFT_PADDLE_POS_Y +" Oikeamaila "+RIGHT_PADDLE_POS_X +" "+RIGHT_PADDLE_POS_Y);

                }   
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
        setTimeout(updateGameState, 1000 / 60);
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

        game.state[clientID] = game.state[clientID] || { position: 4 };

        //muutettu asteikko 0 ja 8 välille selkeyden vuoksi
        if (direction === 'up') {
            game.state[clientID].position = Math.min(game.state[clientID].position + 1, 8);
        } else if (direction === 'down') {
            game.state[clientID].position = Math.max(game.state[clientID].position - 1, 0);
        } else {
            throw new Error("Unknown direction");
        }

        // console.log(`Player ${clientID} moved ${direction}. New position: ${game.state[clientID].position}`);

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
    }
}

/*
function updateBallPosition(gameID) {
    const game = games.get(gameID)
    if (!game) return console.log("ei palloa");

// pallo pelin alussa

if (!game.state.ball) {
    game.state.ball = {
        x: 300, 
        y: 200, 
        dx: 2, 
        dy: 2   
    };
}
    const ball = game.state.ball;

    // päivitä pallo lokaatio

    ball.x += ball.dx;
    ball.y += ball.dy;

    // kolliisio ylä ja alareunan kanssa

    if (ball.y <= 0 || ball.y >= 400) {  
        ball.dy = -ball.dy;  // pallo vaihtaa suuntaa osumasta
    }

    // maila lokaatiot 
    const leftPaddle = game.state[game.clients[0].clientID].position;
    const rightPaddle = game.state[game.clients[1].clientID].position;

     // kolliisio vasemman mailaan kanssa
     if (
        ball.x <= 20 &&  
        ball.y >= leftPaddle &&
        ball.y <= leftPaddle + 100  // 100 maila korkeus
    ) {
        ball.dx = -ball.dx;  // vaihda pallon suunta
    }

    // kolliisio oikean mailan kanssa
    if (
        ball.x >= 580 &&  
        ball.y >= rightPaddle &&
        ball.y <= rightPaddle + 100 // mailan korkeus
    ) {
        ball.dx = -ball.dx; // pallon suunta
    }

    console.log(`Ball position: x=${ball.x}, y=${ball.y}, dx=${ball.dx}, dy=${ball.dy}`);


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

}
*/



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