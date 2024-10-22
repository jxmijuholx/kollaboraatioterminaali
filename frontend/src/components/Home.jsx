import '../App.css';
import { AppBar, Typography, Button, TextField, Box } from '@mui/material';
import { useState } from 'react';
import { json, Link, Outlet, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

import AutorenewIcon from '@mui/icons-material/Autorenew';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

function Home() {

    const [loggedIn, setLoggedIn] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [username, setUsername] = useState("");

    const words = [
        "ocean",
        "mountain",
        "giraffe",
        "keyboard",
        "sunshine",
        "galaxy",
        "puzzle",
        "whisper",
        "journey",
        "rhythm",
        "tiger",
        "umbrella",
        "volcano",
        "horizon",
        "butterfly",
        "river",
        "forest",
        "adventure",
        "harmony",
        "spark"
    ];

    const adjectives = [
        "brilliant",
        "curious",
        "fearless",
        "gentle",
        "vibrant",
        "mysterious",
        "silent",
        "playful",
        "graceful",
        "bold",
        "radiant",
        "calm",
        "elegant",
        "fierce",
        "joyful",
        "persistent",
        "wise",
        "wild",
        "cheerful",
        "daring",
        "goofy",
        "serene",
        "swift",
        "vast",
        "whimsical",
    ];

    const location = useLocation();

    const loginLink = 'http://localhost:8080/auth/login'
    const registerLink = 'http://localhost:8080/auth/register'

    const handleOpenRegister = () => {
        setLoginOpen(false);
        setRegisterOpen(true);
    };

    const handleLogin = async (username, password) => {
        const loginData = {
            username,
            password
        };
        try {
            const res = await fetch(loginLink, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (res.ok) {
                const token = await res.json();
                localStorage.setItem('jwt-token', JSON.stringify(token));
                setUsername(username);
                setLoggedIn(true);
                return true;
            } else {
                console.log("User credentials not found, register or check for spelling errors");
                return false;
            }
        } catch (error) {
            console.error("Login request failed:", error);
        }
    };

    const handleRegister = async (username, password) => {
        const registerData = {
            username,
            password
        };

        try {
            const res = await fetch(registerLink, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            if (res.ok) {
                console.log("User created!");
                alert("Account created!");
                setLoginOpen(true);
                return true;
            } else {
                console.log("Error: Couldn't register user");
                return false;
            }
        } catch (error) {
            console.error("Registration request failed:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt-token');
        localStorage.removeItem('username')
        localStorage.removeItem('gameId')
        localStorage.removeItem('clientId')
        setLoggedIn(false);
        setUsername("");
    };

    const generateName = () => {
        const random = adjectives[Math.floor(Math.random() * adjectives.length)] + "-" + words[Math.floor(Math.random() * words.length)]
        setUsername(random)
    };

    // Check for username before navigating
    const usernameCheck = (event) => {
        if (!username) {
            event.preventDefault();
            alert("Please select a username before playing!")
        } else {
            localStorage.setItem("username", username)
        }
    };

    return (
        <>
            <AppBar position='relative'
                style={{
                    padding: 15,
                    borderRadius: 10,
                    background: "#3a3a3a",
                    color: "white",
                    marginBottom: 20
                }}>
                <Typography variant='h4' >
                    Collaboration terminal (Change name?)
                </Typography>
                {loggedIn ?
                    <Button onClick={handleLogout}>
                        Log out
                        <LogoutIcon />
                    </Button>
                    :
                    <Button variant='contained' onClick={() => setLoginOpen(true)}>
                        Log in
                        <LoginIcon style={{ marginLeft: 2 }} />
                    </Button>
                }
                <Login open={loginOpen} handleLogin={handleLogin} closeLogin={() => setLoginOpen(false)} openRegister={handleOpenRegister} />
                <Register open={registerOpen} handleRegister={handleRegister} closeRegister={() => setRegisterOpen(false)} />
                <Register />
            </AppBar>

            {/* Only display this if we are on the home page */}
            {location.pathname === "/" && (
                <>
                    <Box
                        display={'flex'}
                        flexDirection={'column'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        sx={{ border: 3, padding: 5, borderRadius: 2, width: '300px', margin: 'auto' }}>

                        <Typography variant="h6" sx={{ marginBottom: 2 }}>{username ? username : "Choose username!"}</Typography>
                        <TextField
                            label='Type username...'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ marginBottom: 2, width: '100%' }}
                        />
                        <Box display="flex" justifyContent="space-between" width="100%">
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={generateName}
                                sx={{ display: 'flex', alignItems: 'center', marginRight: 2 }}
                            >
                                Random name
                                <AutorenewIcon />
                            </Button>
                            <Link
                                onClick={usernameCheck}
                                to='/play'>
                                <Button
                                    variant='contained'
                                    color='success'
                                >
                                    Start playing!
                                </Button>
                            </Link>
                        </Box>
                    </Box>

                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        marginTop={3}
                        marginBottom={5}>
                        <Box sx={{ border: 3, borderRadius: 2, width: '45%', padding: 2 }}>
                            <Typography variant='h4'>How to play?</Typography>
                            <Typography variant='h6' >
                                {`Start playing by choosing a username or generate a random name with the "random name" button
                            and then click start playing to navigate to the game setup menu!
  
                            Once in the game setup menu you can create a game or join an existing game by inserting a join code 
                            into the textbox and pressing the join button.
                            
                            After the game lobby is full, you can chat with each other via the on-screen terminal or start the game
                            by typing the "start game" command into the terminal.
  
                             Enjoy!`}
                            </Typography>
                        </Box>

                        <Box sx={{ border: 3, borderRadius: 2, width: '45%', padding: 2 }}>
                            <Typography variant='h4'>About collaboration terminal:</Typography>
                            <Typography variant='h6'>
                                {`Collaboration terminal is a terminal-based Pong game designed for two players to enjoy a classic game of Pong through web-sockets.
                                
                                Collaboration terminal was developed to explore and apply our knowledge in practice, as part of a university course. 
                                The project challenged us to integrate web-sockets for real-time communication and create a functional, multiplayer Pong game with a terminal-based interface. `}
                            </Typography>
                        </Box>
                    </Box>
                </>
            )}

            <Outlet />
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

export default Home;
