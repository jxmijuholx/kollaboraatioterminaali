import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import Error from './components/Error'

import { ThemeProvider, createTheme } from '@mui/material/styles';
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
      secondary: '#39ff14'
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
