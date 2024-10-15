import '../App.css';
import { AppBar, Typography, Button, TextField, Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function Home() {

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
        "spark"];

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

    const [username, setUsername] = useState("");

    const generateName = () => {
        const random = words[Math.floor(Math.random() * words.length)] + "-" + adjectives[Math.floor(Math.random() * adjectives.length)]
        setUsername(random)
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

            {location.pathname === "/" && (
                <>
                    <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography variant='h3'>Welcome to Collaboration terminal!</Typography>
                        <Link
                            onClick={() => localStorage.setItem("username", username)}
                            to='/play'>
                            Start playing!
                        </Link>
                        <TextField
                            label='Type username...'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Button
                            variant='contained'
                            color='warning'
                            onClick={generateName}
                        >
                            Random name
                        </Button>
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
