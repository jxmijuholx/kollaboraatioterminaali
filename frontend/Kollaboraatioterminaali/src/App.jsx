import './App.css';
import { Card, CardContent, AppBar, Typography, Button, Grid2, Snackbar, TextField, Select, FormControl, InputLabel, MenuItem, getFormControlLabelUtilityClasses } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import AddIcon from "@mui/icons-material/Add"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import LinkIcon from "@mui/icons-material/Link"

//käytetään näitä terminaalin importtaukseen toistaiseksi. Nää ainakin jotenkin toimii
import { Terminal } from 'xterm'; 
import 'xterm/css/xterm.css';

function App() {

  const [clientId, setClientId] = useState(null);
  const [ws, setWs] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerSide, setPlayerSide] = useState(null);
  const [open, setOpen] = useState(false);
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [gameID, setGameID] = useState("");
  const [newGameId, setNewGameId] = useState(null);
  const [difficulty, setDifficulty] = useState("");

  //Terminaalia varten
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);//näytä terminaali
  const terminalRef = useRef(null); // viitaus terminaali elementiin 
  const term = useRef(null); // terminaali instanssi viite
  const inputBuffer = useRef(''); // terminaalin input bufferi

  useEffect(() => {
    const newWs = new WebSocket("ws://localhost:8080");

    newWs.onmessage = (message) => {
      const response = JSON.parse(message.data)
      console.log("received message:", message.data)

      switch (response.action) {

        case "connect":
          setClientId(response.clientID);
          console.log("connected to: ", response.clientID);
          localStorage.setItem("clientId", response.clientID);
          break;

        case "create":
          setNewGameId(response.game.id);
          console.log("game created with id: ", response.game.id);
          localStorage.setItem("game id", response.game.id)
          break;

        case "join":
          const game = response.game;
          setPlayers(game.clients);

          game.clients.forEach((player) => {
            if (player.clientID === clientId) {
              setPlayerSide(player.paddle);
            }
          });
          setIsTerminalVisible(true);//Kun liityttään niin terminaali tulee näkyviin
          break;
        
        //Bäkkärille
        case "message":
          // nappaa clientID joko react tilasta tai localStoragesta
          const storedClientId = clientId || localStorage.getItem('clientId');
        
          //Tässä custom prompt generointi
          if (term.current && response.from && response.content) {
            if (response.from !== storedClientId) {  
              const senderColor = response.from !== storedClientId ? '\x1b[32m' : '\x1b[34m'; // Vihreä omaan viestiin, sininen kaverilta
              term.current.write(`\r\n${senderColor}${response.from}: ${response.content}\x1b[0m`);
              // Vielä yksi rivivaihto ja sitten prompt
              term.current.write('\r\n');
              term.current.prompt();
            }
          }
          break;

        case "error":
          console.log("paska ei toimi error: ", response.message)
          break;
      }
    };

    setWs(newWs);

    return () => {
      if (!clientId) {
        newWs.close();
      }
    };
  }, []);

  //Terminaalin useEffect, 
  useEffect(() => {
    if (isTerminalVisible && !term.current && terminalRef.current) {
      
      //Luonti ja alustavat määritykset
      term.current = new Terminal({
        cursorBlink: true,
        rows: 20,
        cols: 80,
        // rightClickSelectsWord: true, // hiiren oikeanappi -> mukaan jos tarvitsee kaataa tai yms.
        convertEol: true // Kursori aina oikeaan laitaan
      });
  
      // Custom prompt luominen
      term.current.open(terminalRef.current);
      term.current.writeln('Welcome to the Kollaboration terminal, try chatting, there is no game yet :3!');
  
      // mukautettu prompt omalla clientID:llä
      term.current.prompt = () => {
        const promptColor = '\x1b[34m'; // sininen
        const promptText = `${promptColor}${clientId}:\x1b[0m $ `; // promt alku
        term.current.write(promptText);
      };
  
      // Näytetään prompt heti, kun terminaali avataan ensimmäisen kerran
      term.current.prompt();
  
      term.current.onData((data) => {
        if (!ws || ws.readyState !== WebSocket.OPEN || !gameID) {
          term.current.writeln("Error: WSocket tai Peli puuttuu.");
          return;
        }
  
        if (data === '\r') { // enter-painallus
          const message = inputBuffer.current.trim();
          if (message) {
            sendMessage(message);
            inputBuffer.current = ''; // tyhjennä syöttö seuraavaa varten
          }
  
          // siirrytään uudelle riville ennen uuden promptin näyttämistä
          term.current.write('\r\n');
          term.current.prompt();
        } else if (data === '\u007F') { // takaisinpäin Backspace avulla
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            term.current.write('\b \b');
          }
        } else {
          inputBuffer.current += data;
          term.current.write(data);
        }
      });
    }
  }, [isTerminalVisible, ws, gameID]);
  
  //lähetä viesti functio
  const sendMessage = (message) => {
    if (!gameID) {
      term.current.writeln('Ei ole huonetta?!.');
      return;
    }
  
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = {
        action: 'sendmessage',
        gameID: gameID,
        clientID: localStorage.getItem('clientId'),  // Localstorageen muistiin
        content: message,  
      };
      // Lähetä viesti ws kautta
      ws.send(JSON.stringify(payload));

    } else {
      term.current.write('\r\n');
      term.current.write('\b \b');
      term.current.writeln('Kukaan ei ole vielä liitynyt huoneeseen :C');
    }
  };
  

  const createGame = () => {
    if (ws && clientId) {
      const payload = {
        "action": "create",
        "clientID": clientId
      }
      ws.send(JSON.stringify(payload));
    }
  };

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
        autoHideDuration={5000}
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
        {isTerminalVisible && (
          <div className='terminaali' ref={terminalRef} style={{ width: "auto", height: "auto" }} ></div>
        )}
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
