import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

function Auth() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const pb = new PocketBase('https://base.jn2p.de');
  const navigate = useNavigate();

  async function login(username: string, password: string) {
    setLoading(true);
    console.log(pb.authStore);
    try {
      const authData = await pb.collection('users').authWithPassword(username, password);
      console.log('hello');
      navigate('/home');
    } catch (err) {
      console.log(err);
      alert('Someting went wrong while logging in');
    }
    setLoading(false);    
  }

  async function signup(username: string, password: string) {
    setLoading(true);
    const data = {
      'username': username,
      'password': password,
      'passwordConfirm': password,
      'name': '',
    };
    try {
      const row = await pb.collection('users').create(data);
      await login(username, password);
    } catch (err) {
      console.log(err);
      alert('Something went wrong while registering');
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
              disabled={loading}
              sx={{ mt: 2, mb: 2 , mr: 1}}
              onClick={(e) => {
                e.preventDefault();
                login(email, password);
              }}
            >
            Login
            </Button>
            <Button
              type="submit"            
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, mb: 2 , ml: 1}}
              onClick={(e) => {
                e.preventDefault();
                signup(email, password);
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
