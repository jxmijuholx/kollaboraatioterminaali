import '../App.css';
import { AppBar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Error() {

    return (
        <>
            <p>Something went wrong</p>
            <img 
                src="./src/assets/Sadge.png" 
                alt="sadge" 
                style={{ width: '75px', height: 'auto', margin: '20px 0' }} 
            />
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Link to={"/"}>
                    <Button
                        variant='contained'
                        color='success'
                    >
                        Back to home page
                    </Button>
                </Link>
            </div>
        </>
    );
}

export default Error;
