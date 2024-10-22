import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Button, Card, CardContent, FormControl, Grid2, InputLabel, MenuItem, Select, Snackbar, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

//käytetään näitä terminaalin importtaukseen toistaiseksi. Nää ainakin jotenkin toimii
import 'xterm/css/xterm.css';
import ChatTerminal from './ChatTerminal';
import GameCanvas from './GameCanvas';

function App() {

  // State variables
  const [clientId, setClientId] = useState(null);
  const [ws, setWs] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerSide, setPlayerSide] = useState(null);
  const [open, setOpen] = useState(false);
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [gameID, setGameID] = useState("");
  const [newGameId, setNewGameId] = useState(null);
  const [difficulty, setDifficulty] = useState("");

  const username = localStorage.getItem('username')

  //Terminaalia varten
  const [isLobbyVisible, setIsLobbyVisible] = useState(false);
  const [isGameVisible, setIsGameVisible] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);//näytä terminaali
  const [action, setAction] = useState(null); // Tilanhallinta napin painalluksille
  const [pelitila, setPelitila] = useState(null)
  const [viesti, setViesti] = useState("");

  // Connect to websocket when opening page
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt-token')
    const parsed = JSON.parse(storedToken);
    const token = parsed.token

    const newWs = new WebSocket(`ws://localhost:8080/?token=${token}`);

    // Receive messages from websocket and print them into the console
    newWs.onmessage = (message) => {
      const response = JSON.parse(message.data)
      console.log("received message:", message.data)

      switch (response.action) {

        // Connect to websocket and set client Id to state variable, store client Id to localstorage 
        case "connect":
          setClientId(response.clientID);
          console.log("connected to: ", response.clientID);
          localStorage.setItem("clientId", response.clientID);
          break;

        // Create new game and set game Id to state variable, store game Id to localstorage
        case "create":
          setNewGameId(response.game.id);
          console.log("game created with id: ", response.game.id);
          localStorage.setItem("gameId", response.game.id)
          break;

        //Join game and set clients to players array
        case "join":
          const game = response.game;
          setPlayers(game.clients);

          // Give clients of the game a paddle side and save them to the state variable
          game.clients.forEach((player) => {
            if (player.clientID === clientId) {
              setPlayerSide(player.paddle);
            }
          });
          setIsLobbyVisible(true);
          setIsTerminalVisible(true);//Kun liityttään niin terminaali tulee näkyviin
          break;

        // Bäkkärille
        case "message":
          // Nappaa clientID joko React-tilasta tai localStoragesta
          const storedClientId = clientId || localStorage.getItem('clientId');

          if (response.content && response.from) {
            // Lähetä koko viestiobjekti setViesti-funktioon
            setViesti({
              from: response.username,  // Lähettäjän nimi
              content: response.content // Viestin sisältö
            });
          }
          break;

        case "update":
          // console.log("Liikettä");
          setPelitila(response.game);
          break;

        // turha atm, tekee konsolista hankalasti luettavan, mutta poistaa error messaget frontin konsolista xd
        case "move":
          console.log("ei toimi")
          break;

        // Print error into console if an error happens
        case "error":
          console.log("paska ei toimi error: ", response.message)
          break;
      }
    };

    setWs(newWs);

    // Close websocket connection on unmount or if theres no clientId
    return () => {
      if (!clientId) {
        newWs.close();
      }
    };
  }, []);

  //lähetä viesti functio
  const sendMessage = (message) => {
    if (!gameID) {
      console.log("ei peliä viestin lähetyksen yhteydessä")
      //   term.current.writeln('Ei ole huonetta?!.');
      return;
    }


    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = {
        action: 'sendmessage',
        gameID: gameID,
        clientID: localStorage.getItem('clientId'),  // Localstorageen muistiin
        username: username,
        content: message,
      };
      // Lähetä viesti ws kautta
      ws.send(JSON.stringify(payload));

    } else {
      console.log("error viestin lähetyksesessä")
    }
  };



  const exitTerminal = () => {
    setIsTerminalVisible(false);
  }

  const handleButtonClick = (actionType) => {
    setAction(actionType); // Päivitä tila napin painalluksella
    switch (actionType) {
      case "play":
        exitTerminal();
        setIsGameVisible(true);
        break;
      case "chat":
        setIsTerminalVisible(true);
        setIsGameVisible(false);
        break;
      default:
        break;
    }

  };


  // Create new game/lobby
  const createGame = () => {
    if (ws && clientId) {
      const payload = {
        "action": "create",
        "clientID": clientId
      }
      ws.send(JSON.stringify(payload));
    }
  };

  // Join an existing game/lobby
  const joinGame = () => {
    if (clientId && gameID && ws) {
      const payload = {
        "action": "join",
        "clientID": clientId,
        "gameID": gameID
      }
      ws.send(JSON.stringify(payload))
    }
  };

  // move paddle function
  const movePaddle = (direction) => {
    if (clientId && gameID && ws && ws.readyState === WebSocket.OPEN) {
      const payload = {
        "action": "move",
        "clientID": clientId,
        "direction": direction,
        "gameID": gameID
      }
      ws.send(JSON.stringify(payload))
      console.log("Player: " + clientId + " moved paddle " + direction)
    }
  };

  // move player paddle up
  const moveUp = () => {
    movePaddle("up")
  };

  // move player paddle down
  const moveDown = () => {
    movePaddle("down")
  };


  // Snackbar handlers
  const handleOpen = () => {
    setOpen(true);
  };

  const handleLobbyOpen = () => {
    setLobbyOpen(true)
  };

  const handleClose = () => {
    setOpen(false)
    setLobbyOpen(false)
  };

  // Handle change to difficulty option
  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value)
  };

  return (
    <>

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={"Implement functionality"}
      />

      <Snackbar
        open={lobbyOpen}
        autoHideDuration={3000}
        onClose={handleClose}
        message={gameID ? "Joined lobby: " + gameID : "Enter game ID!"}
      />

      <Grid2 container spacing={4}>
        <Grid2>
          <Link to={'/'}>Back to home</Link>
        </Grid2>
        <Grid2 xs={12} sm={6} md={3}>
          <Card style={{
            height: 300,
            width: 250,
            background: "gray"
          }}
          >
            <CardContent>
              <Typography variant='h5'>Create game</Typography>
              <Typography
                variant='body1'
                style={{ marginTop: 15 }}
              >
                Create a new game and give the generated game ID to a player to let them join.
              </Typography>
              {newGameId ?
                <Typography>
                  Created game with ID: {newGameId}
                </Typography>
                :
                <Typography style={{ marginTop: 71 }}>
                </Typography>}
              <Button
                onClick={createGame}
                color='success'
                variant='contained'
                style={{ marginTop: 15 }}
              >
                New game
                <AddIcon />
              </Button>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 xs={12} sm={6} md={3}>
          <Card style={{ height: 300, width: 250, background: "gray" }}>
            <CardContent>
              <Typography variant='h5'>Join game</Typography>
              <Typography
                variant='body1'
                style={{ marginTop: 15 }}
              >
                Join an already existing game by entering the game ID below.
              </Typography>
              <TextField
                label="Game ID"
                style={{ marginTop: 15 }}
                value={gameID}
                onChange={(e) => setGameID(e.target.value)}
              />
              <Button onClick={() => {
                joinGame(),
                  handleLobbyOpen
              }}
                color='primary' variant='contained' style={{ marginTop: 15 }}>Join a game <LinkIcon /> </Button>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 xs={12} sm={6} md={3}>
          <Card style={{ height: 300, width: 250, background: "gray" }}>
            <CardContent>
              <Typography variant='h5'>Play local</Typography>
              <Typography
                variant='body1'
                style={{ marginTop: 15 }}
              >
                Create a local game to play single player against a bot. Choose bot difficulty below.
              </Typography>
              <FormControl fullWidth style={{ marginTop: 15 }}>
                <InputLabel id="difficulty-input-label">Choose difficulty</InputLabel>
                <Select
                  labelId='difficulty-input-label'
                  id='difficulty-select'
                  label='Choose difficulty'
                  value={difficulty}
                  onChange={handleDifficultyChange}
                >
                  <MenuItem value={10}>Easy</MenuItem>
                  <MenuItem value={20}>Medium</MenuItem>
                  <MenuItem value={30}>Hard</MenuItem>
                  <MenuItem value={40}>Impossible, Good Luck!</MenuItem>
                </Select>
              </FormControl>
              <Button
                onClick={handleOpen}
                color='success'
                variant='contained'
                style={{ marginTop: 15 }}>
                Play locally
                <SmartToyIcon />
              </Button>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
      <div className='lobbyparagraph'>
        <p>Lobby:</p>
        <p>
          {players && players.length > 1 ?
            "Player 1: " + players[0].clientID + ", " + players[0].paddle + " | " + " Player 2: " + players[1].clientID + ", " + players[1].paddle
            :
            "No players in lobby yet"}
        </p>
        {isLobbyVisible && (
          <div>
            <div className='movementButtons'>
              <Button
                onClick={moveUp}
                color='primary'
                variant='contained'
                style={{ marginBottom: 10 }}>
                Down
              </Button>
              <Button
                onClick={moveDown}
                color='primary'
                variant='contained'
                style={{ marginBottom: 10 }}>
                Up
              </Button>
            </div>
            <div >
              {/* Nappien sisältämä kontti terminaalin yläpuolella */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '10px' }}>
                <button onClick={() => handleButtonClick('play')}>Pelaa</button>
                <button onClick={() => handleButtonClick('chat')}>Chat</button>
                <button onClick={() => handleButtonClick('clear')}>Tyhjennä</button>
                <button onClick={() => handleButtonClick('reset')}>Reset</button>
                <button onClick={() => exitTerminal()}>Exit</button>
              </div>

              {/* Terminaalikontti */}

              {isTerminalVisible && <ChatTerminal username={username} sendMessage={sendMessage} action={action} viesti={viesti} />}
              {isGameVisible && <GameCanvas pelitila={pelitila} />}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;