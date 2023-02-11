import { useState, useEffect } from 'react'
import './App.css';
import PocketBase from 'pocketbase';
import { useNavigate } from 'react-router-dom';
import { Tabs, Tab, Container, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, LinearProgress, IconButton, Box, TextField, Button } from '@mui/material';

export default function Profile() {
    const pb = new PocketBase('https://base.jn2p.de');
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [newPw, setNewPw] = useState('')
    const [newPwConf, setNewPwConf] = useState('')
    const [duration, setDuration] = useState(0)
    const [unit, setUnit] = useState('days')

    async function updateProfile(newPass, newPassConf, currPass) {
        if (newPass !== undefined && newPassConf === newPass && currPass !== undefined) {
            const data = {
                "password": newPass,
                "passwordConfirm": newPassConf,
                "oldPassword": currPass,
            }
            try {
              const record = await pb.collection('users').update(pb.authStore.model.id, data);
              navigate('/home')
            } catch (err) {
              console.log(err)
            }
        }
    }

    function logout(){
      pb.authStore.clear();
      navigate('/auth')
    }

    async function updateWorkTime(duration, unit) {
      try {
        let record = await pb.collection('time_setting').getFirstListItem('user="'+pb.authStore.model.id+'"', {
          expand: 'relField1,relField2.subRelField',
        })
        const data = {
          "user": pb.authStore.model.id,
          "time_val": duration,
          "unit": unit,
        }
        record = await pb.collection('time_setting').update(record.id, data);
        navigate('/home')     
      } catch (error) {
        console.log(error)
      }        
    }

    const handleChange = (event, newValue) => {
      console.log('nw: '+newValue)
      switch(newValue) {
        case 0:
          navigate('/newEntry')
          break
        case 1:
          navigate('/home')
          break
        case 3:
          navigate('/userOverview')
          break
        default:
          break
      }
    };

    const units = [
      {
        value: 'days',
        label: 'day',
      },
      {
        value: 'weeks',
        label: 'week',
      },
      {
        value: 'months',
        label: 'month',
      },
    ]

    return(
      <Container component="main" sx={{width: '100%', bgcolor: 'background.paper'}}>
      <Tabs value={2} onChange={handleChange} centered>
        <Tab label="New Entry" />
        <Tab label="Home" />
        <Tab label="Profile" />
        <Tab label="Others" />
      </Tabs>
      <Container sx={{ 
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
        }}>
        <Typography component="h5" variant="h5" sx={{mb: 2}} >
          Hello {pb.authStore.model.username}
        </Typography>        
        <TextField
            type="password"
            label="Current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{mb: 2}}
          />
        <TextField
            type="password"
            label="New password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            sx={{mb: 2}}
          />
        <TextField
            type="password"
            label="Confirm new password"
            value={newPwConf}
            onChange={(e) => setNewPwConf(e.target.value)}
            sx={{mb: 2}}
          />
          <Button
            type="submit"            
            variant="contained"
            sx={{ mt: 2, mb: 2 , mr: 1}}
            onClick={() => updateProfile(newPw, newPwConf, password)}
          >
            Save password
          </Button>
        <Typography variant="h6" sx={{mb: 2}} >
          Change work time goal
        </Typography>
        <TextField
            type="number"
            placeholder="0"
            label="Duration minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            sx={{mb: 2}}
        />
        <TextField
          id="outlined-select-currency-native"
          select
          label="Duration"
          defaultValue="days"
          onChange={(e) => setUnit(e.target.value)}
          SelectProps={{
            native: true,
          }}
          helperText="Please select the duration"
        >
          {units.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField> 
        <Button
            type="submit"            
            variant="contained"
            sx={{ mt: 2, mb: 2 , mr: 1}}
            onClick={() => updateWorkTime(duration, unit)}
          >
            Save goal!
          </Button>
          <Button
            type="submit"            
            variant="contained"
            sx={{ mt: 2, mb: 2 , mr: 1}}
            onClick={() => logout()}
          >
            Logout!
          </Button>
      </Container>
      </Container>
    )


}