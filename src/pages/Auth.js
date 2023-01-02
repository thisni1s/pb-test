import './App.css';
import { useState } from 'react'
import { Navigate } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import PocketBase from 'pocketbase';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const pb = new PocketBase('https://base.jn2p.de');
  const navigate = useNavigate()

  async function login(username, password, firstTime) {
    console.log(pb.authStore)
    try {
      const authData = await pb.collection('users').authWithPassword(username, password);
      if (firstTime) {
        const data = {
          "user": pb.authStore.model.id,
          "time_val": 720,
          "unit": "months"
        };
        const record = await pb.collection('time_setting').create(data);
      }
      console.log('hello')
      navigate('/home')
    } catch (err) {
      console.log(err)
    }
    
  }

  async function signup(username, password) {
    const data = {
      "username": username,
      "password": password,
      "passwordConfirm": password,
      "name": "",
    };
    try {
      const row = await pb.collection('users').create(data);
      await login(username, password, true)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in or Register
        </Typography>
        <Box sx={{ 
          mt: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
        }}>
        <Box sx={{mb: 1}}>
        <TextField
            className="inputField"
            type="username"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>
        <Box sx={{mt: 1}}>
          <TextField
            className="inputField"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>
        <Box>
          <Button
            type="submit"            
            variant="contained"
            sx={{ mt: 2, mb: 2 , mr: 1}}
            onClick={(e) => {
              e.preventDefault()
              login(email, password, false)
            }}
          >
            Login
          </Button>
          <Button
            type="submit"            
            variant="contained"
            sx={{ mt: 2, mb: 2 , ml: 1}}
            onClick={(e) => {
              e.preventDefault()
              signup(email, password)
            }}
          >
            Register
          </Button>
        </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Auth;
