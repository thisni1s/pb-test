import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PocketBase from 'pocketbase';
import Home from './pages/Home';
import Auth from './pages/Auth';
import History from './pages/History';
import { Navigate } from 'react-router-dom';
import Profile from './pages/Profile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

function App() {

  const pb = new PocketBase('https://base.jn2p.de');

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthTest pb={pb} />} />
          <Route path='/home' element={<Home state={{pb: pb}} />} />
          <Route path='/auth' element={<Auth state={{pb: pb}} />} />
          <Route path='/profile' element={<Profile state={{pb: pb}} />} />
          <Route path='/history' element={<History state={{pb: pb}} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}


export function AuthTest({ pb }) {
  return(
    <>
      {pb.authStore.isValid ? <Navigate to='/home' state={{pb: pb}}/> : <Navigate to='/auth' state={{pb: pb}}/>}
    </>
  );
}

export default App;
