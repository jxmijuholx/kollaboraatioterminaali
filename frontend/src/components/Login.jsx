import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import LoginIcon from '@mui/icons-material/Login';


function Login({ open, closeLogin, handleLogin, openRegister }) {

    //State variables
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    //Form submission handler
    const handleSubmit = async (event) => {
        event.preventDefault();
        const success = await handleLogin(username, password);
        if (success) {
            setUsername('');
            setPassword('');
            setError(null);
            closeLogin();
        } else {
            setError('Wrong username or password!');
        }
    };

    //Handler for closing dialog
    const handleClose = () => {
        setPassword('');
        setUsername('');
        setError(null);
        closeLogin();
    }


    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                style={{ color: "inherit" }}
            >
                <DialogTitle>Login to collaboration terminal</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            required
                            value={username}
                            label="Username"
                            placeholder="Type username..."
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ marginBottom: "9px", marginRight: "9px", marginTop: "9px" }}
                        />
                        <TextField
                            required
                            type="password"
                            value={password}
                            label="Password"
                            placeholder="Type password..."
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ marginBottom: "9px", marginRight: "9px", marginTop: "9px" }}
                        />
                        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                        <DialogActions>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                type="submit"
                            >
                                Login
                                <LoginIcon />
                            </Button>
                            <Typography>Don't have an account yet? Create one now!</Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={openRegister}
                            >
                                Create account
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )

}

export default Login;