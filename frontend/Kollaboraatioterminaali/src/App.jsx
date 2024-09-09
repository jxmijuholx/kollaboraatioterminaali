import './App.css';
import { Card, CardContent, AppBar, Typography, Button, Grid2, Snackbar, TextField } from '@mui/material';
import { useState } from 'react';

function App() {

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false)
  };

  return (
    <>
      <AppBar position='fixed' style={{ padding: 15, borderRadius: 10, marginTop: 4, maxWidth: 1272, marginRight: 4, background: "gray", color: "black" }}>
        <Typography variant='h5' >
          Collaboration terminal (Change name?)
        </Typography>
      </AppBar>

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        message="TODO: you lazy mf"
        action={handleClose}
      />

      <Grid2
        container
        spacing={4}
      >
        <Grid2 item xs={12} sm={6} md={3}>
          <Card style={{ height: 300, width: 250, background: "gray" }}>
            <CardContent>
              <Typography variant='h5'>Create game</Typography>
              <Typography variant='body1' style={{ marginTop: 15 }}>Create a new game and give the generated game ID to a player to let them join.</Typography>
              <Button onClick={handleOpen} color='success' variant='contained' style={{ marginTop: 86 }}>New game</Button>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 item xs={12} sm={6} md={3}>
          <Card style={{ height: 300, width: 250, background: "gray" }}>
            <CardContent>
              <Typography variant='h5'>Join game</Typography>
              <Typography variant='body1' style={{ marginTop: 15 }}>Join an already existing game by entering the game ID below.</Typography>
              <TextField label="Game ID" style={{ marginTop: 15 }} />
              <Button onClick={handleOpen} color='primary' variant='contained' style={{ marginTop: 15 }}>Join a game</Button>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
      <div className='footer'>
        <footer>
          <p>
            Contributors:
          </p>
          <div className='footerLinks'>
            <a href="https://github.com/AbuAk1">@AbuAk1 |</a>
            <a href="https://github.com/jxmijuholx"> @jxmijuholx |</a>
            <a href="https://github.com/Santks"> @Santks |</a>
            <a href="https://github.com/Tuutej"> @Tuutej</a>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
