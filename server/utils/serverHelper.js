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

             //siirretty pallon tila ja kollaiderit erillisestä funktiosta tänne ettei pelilooppi pysähdy

             // pallo pelin alussa, jos sitä ei ole vielä asetettu
             if (!game.state.ball) {
                //Palloa ei ole, joten asetetaan keskelle ja annetaan random suunta mihin lähtee x ja y kertoimilla
                game.state.ball = {
                    x: 300, 
                    y: 200,  
                    dx: Math.random() < 0.5 ? 2 : -2, 
                    dy: Math.random() < 0.5 ? 2 : -2,
                    speed: 2 //pallon liikkumisnopeuskerroin
                };
            }

            //pallon alustus
            const ball = game.state.ball;

            // Päivitetään pallon sijainti x- ja y-akseleilla
            ball.x += ball.dx * ball.speed;
            ball.y += ball.dy * ball.speed;

            // Törmäys ylä- ja alareunoihin
            if (ball.y <= 0 || ball.y >= 400) {  // Oletetaan pelialueen korkeus 400 -> nämä voisi vaihtaa muuttujiksi
                ball.dy = -ball.dy;  // vaihdetaan suuntaa y akselilla jos osuu canvasin ylä- tai alareunaan
            }

            // Hakee pelaajien positiot pelitilasta. game.state sisältää arrayn jossa eka pallon ja mailat
            const playerPositions = Object.entries(game.state)
                .filter(([key]) => key !== "ball")
                .map(([clientID, clientData]) => clientData.position);

            // p1 ja p2 pelaajien positiot
            const p1 = playerPositions[0] || 0; 
            const p2 = playerPositions[1] || 0; 

            // Skaalataan position-arvot pelialueen korkeuden mukaisiksi -> 8 ja -8 välillä 
            const leftPaddlePosition = (p1 + 8) * 25;   
            const rightPaddlePosition = (p2 + 8) * 25;  

            //osuuko mailaan
            let collidedWithPaddle = false;

            // Törmäys vasemman mailan kanssa (pelaaja 1:n maila), kun pallo on vasemmalla reunalla
            if (ball.x <= 20) {  // Pallon vasen reuna
                if (ball.y >= leftPaddlePosition && ball.y <= leftPaddlePosition + 100) {  // Mailan korkeus 100
                    ball.dx = -ball.dx;  // Vaihdetaan suunta x-akselilla, jos pallo osuu vasempaan mailaan
                    collidedWithPaddle = true;
                }
            }

            // Törmäys oikean mailan kanssa (pelaaja 2:n maila), kun pallo on oikealla reunalla
            if (ball.x >= 580) {  // Pallon oikea reuna
                if (ball.y >= rightPaddlePosition && ball.y <= rightPaddlePosition + 100) {  // Mailan korkeus 100
                    ball.dx = -ball.dx;  // Vaihdetaan suunta x-akselilla, jos pallo osuu oikeaan mailaan
                    collidedWithPaddle = true;
                }
            }

            // Jos pallo ohittaa mailan ilman osumaa, siirretään se keskelle
            if (!collidedWithPaddle && (ball.x < 0 || ball.x > 600)) {
                ball.x = 300;
                ball.y = 200;  // Palautetaan y-koordinaatti keskelle
                ball.dx = Math.random() < 0.5 ? 2 : -2;
                ball.dy = Math.random() < 0.5 ? 2 : -2;
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

        game.state[clientID] = game.state[clientID] || { position: 0 };

        if (direction === 'up') {
            game.state[clientID].position = Math.max(game.state[clientID].position - 1, -8);
        } else if (direction === 'down') {
            game.state[clientID].position = Math.min(game.state[clientID].position + 1, 8);
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

// function updateBallPosition(gameID) {
//     const game = games.get(gameID);
//     if (!game) return console.log("ei palloa");

//     // Määritetään pallo pelin alussa, jos sitä ei ole vielä asetettu
//     if (!game.state.ball) {
//         game.state.ball = {
//             x: 300, 
//             y: 200, 
//             dx: Math.random() < 0.5 ? 2 : -2,  // Satunnainen suunta x-akselilla
//             dy: Math.random() < 0.5 ? 2 : -2   // Satunnainen suunta y-akselilla
//         };
//     }

//     const ball = game.state.ball;

//     // Päivitetään pallon sijainti
//     ball.x += ball.dx;
//     ball.y += ball.dy;

//     // Kollisio ylä- ja alareunan kanssa
//     if (ball.y <= 0 || ball.y >= 400) {  
//         ball.dy = -ball.dy;  // Pallo vaihtaa suuntaa osumasta
//     }

//     // Mailojen sijainnit
//     const leftPaddle = game.state[game.clients[0].clientID].position;
//     const rightPaddle = game.state[game.clients[1].clientID].position;

//     // Kollisio vasemman mailan kanssa
//     if (
//         ball.x <= 20 &&  
//         ball.y >= leftPaddle &&
//         ball.y <= leftPaddle + 100  // Mailan korkeus 100
//     ) {
//         ball.dx = -ball.dx;  // Vaihdetaan pallon suunta
//     }

//     // Kollisio oikean mailan kanssa
//     if (
//         ball.x >= 580 &&  
//         ball.y >= rightPaddle &&
//         ball.y <= rightPaddle + 100 // Mailan korkeus 100
//     ) {
//         ball.dx = -ball.dx; // Vaihdetaan pallon suunta
//     }

//     console.log(`Ball position: x=${ball.x}, y=${ball.y}, dx=${ball.dx}, dy=${ball.dy}`);

//     const payload = {
//         action: "update",
//         game: {
//             id: gameID,
//             clients: game.clients,
//             state: game.state
//         }
//     };

//     game.clients.forEach(c => {
//         const clientConnection = clients.get(c.clientID).connection;
//         if (clientConnection && clientConnection.connected) {
//             clientConnection.send(JSON.stringify(payload));
//         }
//     });
// }




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