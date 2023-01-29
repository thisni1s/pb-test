import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PocketBase from 'pocketbase';
import Home from './pages/Home';
import Auth from './pages/Auth'
import { Navigate } from "react-router-dom";
import Profile from "./pages/Profile";
import NewEntry from "./pages/NewEntry";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import UserOverview from "./pages/UserOverview";
import { GlobulContextProvider } from './GlobulContext';

function App() {

  const pb = new PocketBase('https://base.jn2p.de');

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <GlobulContextProvider>
    <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthTest pb={pb} />} />
        <Route path="/home" element={<Home state={{pb: pb}} />} />
        <Route path="/auth" element={<Auth state={{pb: pb}} />} />
        <Route path="/profile" element={<Profile state={{pb: pb}} />} />
        <Route path="/newEntry" element={<NewEntry state={{pb: pb}} />} />
        <Route path="/userOverview" element={<UserOverview state={{pb: pb}} />} />
    </Routes>
  </BrowserRouter>
  </ThemeProvider>
  </GlobulContextProvider>
  );
}


export function AuthTest({ pb }) {
  return(
    <>
    {pb.authStore.isValid ? <Navigate to="/home" state={{pb: pb}}/> : <Navigate to="/auth" state={{pb: pb}}/>}
    </>
  )
}

export default App;
