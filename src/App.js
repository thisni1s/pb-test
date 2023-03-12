import React, { useState, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import PocketBase from 'pocketbase';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './pages/Home';
import Auth from './pages/Auth';
import History from './pages/History';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function getTheme(themeName) {
  switch (themeName) {
    case 'dark':
      return darkTheme;
    case 'light':
      return lightTheme;
    default:
      return darkTheme;
  }
}

export const ThemeContext = createContext(getTheme('dark'));

function App() {
  const [themeName, setThemeName] = useState('dark');
  const pb = new PocketBase('https://base.jn2p.de');

  const theme = getTheme(themeName);


  return (
    <ThemeContext.Provider value={setThemeName}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthTest pb={pb} />} />
          <Route path='/home' element={<Home state={{pb: pb}} />} />
          <Route path='/auth' element={<Auth state={{pb: pb}} />} />
          <Route path='/profile' element={<Profile state={{pb: pb}} />} />
          <Route path='/history' element={<History state={{pb: pb}} />} />
          <Route path='/statistics' element={<Statistics state={{pb: pb}} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
    </ThemeContext.Provider>
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
