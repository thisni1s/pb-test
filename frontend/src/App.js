import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import PocketBase from 'pocketbase';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './pages/Home';
import Auth from './pages/Auth';
import History from './pages/History';
import Statistics from './pages/Statistics';
import config from './config.json'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
        variant: 'outlined'
      }
    }
  }
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

export const ThemeContext = createContext();
export const ChPassContext = createContext();

function App() {
  const [themeName, setThemeName] = useState(getSaneThemeName());
  const baseUrl = config.baseUrl
  const pb = new PocketBase(baseUrl);

  
  useEffect(() => {
    setThemeName(getSaneThemeName())
  }, [])
  
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(themeName))
  }, [themeName])
  
  const theme = getTheme(themeName);
  
  function getSaneThemeName() {
    const themeName = JSON.parse(localStorage.getItem('theme'))
    if (themeName !== 'dark' && themeName !== 'light') {
      return 'dark'
    } else {
      return themeName
    }
  }

  async function changePassword(oldPw, newPw) {
    try {
      const record = await pb.collection('users').update(pb.authStore.model.id, {
        'password': newPw,
        'passwordConfirm': newPw,
        'oldPassword': oldPw,
      });
    } catch (error) {
      console.log(error);
      alert('Fehler beim ändern des Passworts. Hast du das alte Passwort richtig eingegeben?');
    }
  }

  return (
    <ThemeContext.Provider value={setThemeName}>
    <ThemeProvider theme={theme}>
    <ChPassContext.Provider value={changePassword}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthTest pb={pb} />} />
          <Route path='/home' element={<Home state={{pb: pb}} />} />
          <Route path='/auth' element={<Auth state={{pb: pb}} />} />
          <Route path='/history' element={<History state={{pb: pb}} />} />
          <Route path='/statistics' element={<Statistics state={{pb: pb}} />} />
        </Routes>
      </BrowserRouter>
    </ChPassContext.Provider>
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
