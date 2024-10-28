import '../App.css';
import { AppBar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Error() {

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

            <p>Something went wrong sadge</p>
            <Link to={"/"}>
                <Button
                    variant='contained'
                    color='success'
                >
                    Back to home page
                </Button>
            </Link>

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

export default Error;
