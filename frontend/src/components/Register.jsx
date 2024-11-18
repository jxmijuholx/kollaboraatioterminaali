import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { useState } from "react";

function Register({ open, handleRegister, closeRegister }) {

    //State variables
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const [error, setError] = useState(null);

    //Form submission handler
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== checkPassword) {
            setError("Passwords do not match!");
            return;
        }

        const success = await handleRegister(username, password);
        if (success) {
            setUsername('');
            setPassword('');
            setCheckPassword('');
            setError(null);
            closeRegister();
        } else {
            setError("Invalid username or passwords do not match!");
        }
    };

    //Handler for closing dialog
    const handleClose = () => {
        setPassword('');
        setUsername('');
        setError(null);
        closeRegister();
    }


    return (
        <>
            <Dialog open={open} onClose={handleClose} style={{ color: "inherit" }}>
                <DialogTitle>Create an account</DialogTitle>
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
                        <TextField
                            required
                            type="password"
                            value={checkPassword}
                            label="Verify password"
                            placeholder="Type password again"
                            onChange={(e) => setCheckPassword(e.target.value)}
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
                                onClick={handleSubmit}
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


export default Register;