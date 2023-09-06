import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PocketBase, { ClientResponseError } from 'pocketbase'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import config from '../config.json'
import { getGermanErrorNames } from '../helpers'

function Auth() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const pwRef = useRef(null)
  const baseUrl = config.baseUrl
  const pb = new PocketBase(baseUrl)
  const navigate = useNavigate()

  async function login(username: string, password: string) {
    if (username.length > 0 && password.length > 7) {
      setLoading(true)
      console.log(pb.authStore)
      try {
        const authData = await pb.collection('users').authWithPassword(username, password)
        console.log('hello')
        navigate('/home')
      } catch (err) {
        const e = err as ClientResponseError
        console.log(e.data)
        alert(getGermanErrorNames(e.data.message))
      }
      setLoading(false)
    } else {
      alert('Nutzername und Passwort sind Pflichtfelder! Das Passwort muss mindestens 8 Zeichen haben!')
    }
  }

  async function signup(username: string, password: string) {
    if (username.length > 0 && password.length > 7) {
      setLoading(true)
      const data = {
        username,
        password,
        passwordConfirm: password,
        name: ''
      }
      try {
        const row = await pb.collection('users').create(data)
        await login(username, password)
      } catch (err) {
        const e = err as ClientResponseError
        let text = 'Something went wrong while registering' 
        console.log(e.data.data)
        for(const key in e.data.data) {
          text = getGermanErrorNames(e.data.data[key].message)
        }
        alert(text)
      }
    } else {
      alert('Nutzername und Passwort sind Pflichtfelder! Das Passwort muss mindestens 8 Zeichen haben!')
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
          alignItems: 'center'
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
          alignItems: 'center'
        }}>
          <Box sx={{ mb: 1 }}>
            <TextField
              className="inputField"
              type="username"
              placeholder="Username"
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
            />
          </Box>
          <Box sx={{ mt: 1 }}>
            <TextField
              className="inputField"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value) }}
              ref={pwRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void login(email, password)
                }
              }}
            />
          </Box>
          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, mb: 2, mr: 1 }}
              onClick={(e) => {
                e.preventDefault()
                void login(email, password)
              }}
            >
            Login
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, mb: 2, ml: 1 }}
              onClick={(e) => {
                e.preventDefault()
                void signup(email, password)
              }}
            >
            Register
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default Auth
