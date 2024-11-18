import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import Error from './components/Error'

import { ThemeProvider, createTheme, keyframes } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#000000',
    },
    text: {
      primary: '#39ff14',
      secondary: '#39ff14',
    },
    primary: {
      main: '#39ff14'
    },
    secondary: {
      main: '#39ff14'
    },
  },
  typography: {
    fontFamily: '"Courier New", Courier, monospace',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bold'
        }
      },
      variants: [
        {
          props: { variant: 'shiny' },
          style: {
            border: '1px solid #39ff14',
            color: 'black',
            backgroundColor: '#39ff14',
            '&:hover': {
              backgroundColor: '#2fcc10',
              border: '1px solid #2fcc10',
            },
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 5px 2px #39ff14' },
              '50%': { boxShadow: '0 0 15px 4px #39ff14' },
              '100%': { boxShadow: '0 0 5px 2px #39ff14' },
            },
          }
        }
      ]
    }
  }
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <Error />,
    children: [
      {
        path: 'play',
        element: <App />
      },
    ]
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
