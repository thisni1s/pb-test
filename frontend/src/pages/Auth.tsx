import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PocketBase, { ClientResponseError, AuthProviderInfo } from 'pocketbase'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { Stack } from '@mui/system'
import config from '../config.json'
import { getGermanErrorNames } from '../helpers'

function Auth() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [authProviders, setAuthProviders] = useState<AuthProviderInfo[]>([])
  const pwRef = useRef(null)
  const baseUrl = config.baseUrl
  const pb = new PocketBase(baseUrl)
  const navigate = useNavigate()

  useEffect(() => {
    getAuthProviders()
  }, [])

  async function getAuthProviders() {
    try {
      setAuthProviders((await pb.collection('users').listAuthMethods()).authProviders)
      } catch (error) {
      console.log(error)
    }    
  }

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
    setLoading(false)
  }

  async function oauth(name: string) {
    setLoading(true)
    try {
      await pb.collection('users').authWithOAuth2({ provider: name });
      if(pb.authStore.isValid) {
        navigate('/home')
      } else {
        alert('Die OAuth authentifizierung war fehlerhaft!')
      }     
    } catch (error) {
      console.log(error)
      alert('Die OAuth authentifizierung war fehlerhaft!')
    }
    setLoading(false)
  }

  function AuthProviders() {
    return authProviders
      .map(provider => { 
        return <Button
         type="submit"
         variant="contained"
         disabled={loading}
         sx={{ mt: 2, mb: 2, ml: 1 }}
         onClick={ (e) => {
          e.preventDefault()
          void oauth(provider.name)
          }}
        >
          {provider.name}
        </Button> 
      })
  }

  return (
    <Container component="main" maxWidth="xs">
      <Stack spacing={1} sx={{ pt: 5, alignItems: 'center' }}>
        <Avatar sx={{bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant='h3'>
          Zeitfinder
        </Typography>
        <Typography component="h2" variant="h5">
          Einloggen oder Registrieren
        </Typography>
        <TextField
          className="inputField"
          type="username"
          placeholder="Username"
          value={email}
          onChange={(e) => { setEmail(e.target.value) }}
          sx={{pt: 2}}
        />       
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
        <Stack direction='row'>
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
            Registrieren
          </Button>
        </Stack>
        {
          authProviders.length > 0 ?
          <>
            <Typography>Mit OAuth2 Provider einloggen:</Typography>
            <Stack direction='row'>
              { AuthProviders() }          
            </Stack>
          </>
          :
          <></>
        }
      </Stack>      
    </Container>
  )
}

export default Auth
