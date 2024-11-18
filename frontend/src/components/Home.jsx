import '../App.css';
import { AppBar, Typography, Button, TextField, Box, Toolbar, List, ListItem } from '@mui/material';

import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../App.css';
import Login from './Login';
import Register from './Register';
import { generateName } from './DisplayNameGenerator';

import AutorenewIcon from '@mui/icons-material/Autorenew';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

function Home() {

    // State variables
    const [loggedIn, setLoggedIn] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [username, setUsername] = useState("");

    const location = useLocation();

    const buttonVariant = loggedIn ? 'shiny' : 'outlined'

    const loginLink = 'https://kollabterm.fly.dev/auth/login'
    const registerLink = 'https://kollabterm.fly.dev/auth/register'

    // Check localstorage for token to see if user is logged in so that refreshing page doesnt "log user out"
    useEffect(() => {
        const token = localStorage.getItem("jwt-token");
        const user = localStorage.getItem("username");
        if (token && user) {
            setLoggedIn(true);
            setUsername(user);
        }
    }, []);

    // Dialog handler
    const handleOpenRegister = () => {
        setRegisterOpen(true);
    };

    // Log in to an existing account
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
                localStorage.setItem("username", username)
                return true;
            } else {
                console.log("User credentials not found, register or check for spelling errors");
                return false;
            }
        } catch (error) {
            console.error("Login request failed:", error);
        }
    };

    // Register a new user
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

    // Log user out by deleting localstorage content
    const handleLogout = () => {
        localStorage.removeItem('jwt-token');
        localStorage.removeItem('username')
        localStorage.removeItem('gameId')
        localStorage.removeItem('clientId')
        setLoggedIn(false);
        setUsername("");
    };

    // Generate a random display name for the user
    const handleGenerateName = () => {
        const random = generateName()
        setUsername(random)
    };

    // Check if user is logged in before letting them access play page
    const usernameCheck = (event) => {
        if (!username || loggedIn === false) {
            event.preventDefault();
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
                    marginBottom: 20,
                    minWidth: '1200px'
                }}>
                <Toolbar style={{ display: 'flex', alignItems: 'center' }}>
                    {location.pathname === "/play" ?
                        <Box flex={1} display='flex' justifyContent='flex-start'>
                            <Link to={'/'}>
                                <Button
                                    variant='contained'
                                    color='primary'
                                >
                                    Back to home
                                </Button>
                            </Link>
                        </Box>
                        :
                        <Box flex={1} display='flex' justifyContent='flex-start'></Box>
                    }
                    <Box flex={1} display='flex' justifyContent='center'>
                        <Typography variant='h4'>
                            Kollabterm
                        </Typography>
                    </Box>
                    <Box flex={1} display='flex' justifyContent='flex-end' >
                        {loggedIn ?
                            <Link to={"/"}>
                                <Button
                                    variant='outlined'
                                    onClick={handleLogout}
                                >
                                    Log out
                                    <LogoutIcon />
                                </Button>
                            </Link>
                            :
                            <Button variant='contained' onClick={() => setLoginOpen(true)}>
                                Log in
                                <LoginIcon />
                            </Button>
                        }</Box>
                    <Login open={loginOpen} handleLogin={handleLogin} closeLogin={() => setLoginOpen(false)} />
                    <Register open={registerOpen} handleRegister={handleRegister} closeRegister={() => setRegisterOpen(false)} />
                    <Register />
                </Toolbar>
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

                        <Typography
                            variant="h6"
                            sx={{ marginBottom: 2 }}>
                            {username ? "Welcome " + username + "!" : "Choose display name!"}
                        </Typography>
                        <TextField
                            label='Type display name..'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ marginBottom: 2, width: '100%' }}
                        />
                        <Box display="flex" justifyContent="space-between" width="100%">
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={handleGenerateName}
                                sx={{ display: 'flex', alignItems: 'center', marginRight: 2 }}
                            >
                                Random name
                                <AutorenewIcon />
                            </Button>
                            <Link
                                onClick={(e) => {
                                    if (!loggedIn) {
                                        e.preventDefault();
                                    } else {
                                        usernameCheck();
                                    }
                                }}
                                to='/play'
                            >
                                <Button
                                    variant={buttonVariant}
                                    disabled={!loggedIn}
                                >
                                    Start playing!
                                </Button>
                            </Link>
                        </Box>
                    </Box>

                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                        marginTop={3}
                        marginBottom={5}>
                        <Box sx={{ width: 'auto', alignItems: 'center' }}>
                            <Typography variant='h4'>How to play?</Typography>
                            <Typography variant='h6' >
                                <List >
                                    <ListItem>- Get started by logging in or creating an account:
                                        <Button
                                            style={{ marginLeft: 5 }}
                                            variant="contained"
                                            onClick={handleOpenRegister}
                                        >
                                            Create account
                                        </Button></ListItem>
                                    <ListItem>- After logging in successfully choose a display name (or keep your login username)</ListItem>
                                    <ListItem>- Click on "start playing" after you have logged in and chosen a display name.</ListItem>
                                    <ListItem>- You will be taken to a "play" page where you have the option to create or join a game.</ListItem>
                                    <ListItem>- To create a game click the "create game" button and copy the code to the textbox above the "join game" button</ListItem>
                                    <ListItem>- The click the "join game" button to join the newly created lobby</ListItem>
                                    <ListItem>- Wait for the other player to join and press the "ready" button. (The game will start after both players are ready)</ListItem>
                                    <ListItem>- You can chat to the other player via the on-screen terminal</ListItem>
                                    <ListItem>- If you want to join a game you need the lobby code from the other player</ListItem>
                                    <ListItem>- After getting the code, type or paste it into the textbox above the "join game" button and press "join game"</ListItem>
                                    <ListItem>- Enjoy!</ListItem>
                                </List>
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
