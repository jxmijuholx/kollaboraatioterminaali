import '../App.css';
import { AppBar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Error() {

    return (
        <>
            <p>Something went wrong sadge</p>
            <Link to={"/"}>
                <Button
                    variant='contained'
                    color='success'
                >
                    Back to home page
                </Button>
            </Link>
        </>
    );
}

export default Error;
