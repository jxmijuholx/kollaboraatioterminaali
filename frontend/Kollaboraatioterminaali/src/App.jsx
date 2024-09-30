import './App.css';
import { Card, CardContent, AppBar, Typography, Button, Grid2, Snackbar, TextField, Select, FormControl, InputLabel, MenuItem, getFormControlLabelUtilityClasses } from '@mui/material';
import { useState, useEffect } from 'react';
import AddIcon from "@mui/icons-material/Add"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import LinkIcon from "@mui/icons-material/Link"

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

  // Connect to websocket when opening page
  useEffect(() => {
    const newWs = new WebSocket("ws://localhost:8080");

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
          localStorage.setItem("game id", response.game.id)
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
      <AppBar position='fixed'
        style={{
          padding: 15,
          borderRadius: 10,
          marginTop: 4,
          maxWidth: 1272,
          marginRight: 4,
          background: "#3a3a3a",
          color: "white",
        }}>
        <Typography variant='h5' >
          Collaboration terminal (Change name?)
        </Typography>
      </AppBar>

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

      <Grid2 container spacing={3}>
        <Grid2 xs={12} sm={6} md={3}>
          <Card style={{ height: 300, width: 250, background: "gray" }}>
            <CardContent>
              <Typography variant='h5'>Create game</Typography>
              <Typography variant='body1' style={{ marginTop: 15 }}>Create a new game and give the generated game ID to a player to let them join.</Typography>
              {newGameId ? <Typography>Created game with ID: {newGameId}</Typography> : <Typography style={{ marginTop: 71 }}></Typography>}
              <Button onClick={createGame} color='success' variant='contained' style={{ marginTop: 15 }}>New game <AddIcon /> </Button>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 xs={12} sm={6} md={3}>
          <Card style={{ height: 300, width: 250, background: "gray" }}>
            <CardContent>
              <Typography variant='h5'>Join game</Typography>
              <Typography variant='body1' style={{ marginTop: 15 }}>Join an already existing game by entering the game ID below.</Typography>
              <TextField
                label="Game ID"
                style={{ marginTop: 15 }}
                value={gameID}
                onChange={(e) => setGameID(e.target.value)}
              />
              <Button onClick={() => {
                joinGame(),
                  handleLobbyOpen()
              }}
                color='primary' variant='contained' style={{ marginTop: 15 }}>Join a game <LinkIcon /> </Button>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 xs={12} sm={6} md={3}>
          <Card style={{ height: 300, width: 250, background: "gray" }}>
            <CardContent>
              <Typography variant='h5'>Play local</Typography>
              <Typography variant='body1' style={{ marginTop: 15 }}>Create a local game to play single player against a bot. Choose bot difficulty below.</Typography>
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
              <Button onClick={handleOpen} color='success' variant='contained' style={{ marginTop: 15 }}>Play locally <SmartToyIcon /> </Button>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
      <div className='lobbyparagraph'>
        <p>Lobby:</p>
        <p>{players && players.length > 1 ? "Player 1: " + players[0].clientID + ", " + players[0].paddle + " | " + " Player 2: " + players[1].clientID + ", " + players[1].paddle
          : "No players in lobby yet"}</p>
      </div>
      <div className='footer'>
        <footer>
          <p>
            Contributors:
          </p>
          <div className='footerLinks'>
            <a href="https://github.com/AbuAk1"> @AbuAk1 </a>
            <a href="https://github.com/jxmijuholx"> @jxmijuholx </a>
            <a href="https://github.com/Santks"> @Santks </a>
            <a href="https://github.com/Tuutej"> @Tuutej</a>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
