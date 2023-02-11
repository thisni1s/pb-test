import { useState, useEffect } from 'react'
import './App.css';
import PocketBase from 'pocketbase';
import { useNavigate } from 'react-router-dom';
import { Tabs, Tab, Container, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, LinearProgress, IconButton, Box, TextField, Button } from '@mui/material';

export default function NewEntry() {
    const pb = new PocketBase('https://base.jn2p.de');
    const navigate = useNavigate()
    const [duration, setDuration] = useState(0)
    const [description, setDescription] = useState('')

    async function createEntry(dur, desc) {
        try {
          const data = {
            "user": pb.authStore.model.id,
            "duration_min": dur,
            "description": desc,
          };
        
        const record = await pb.collection('work_entries').create(data);
        navigate('/home')
        } catch (err) {
            console.log(err)
        }
        

    }

    const handleChange = (event, newValue) => {
      console.log('nw: '+newValue)
      switch(newValue) {
        case 2:
          navigate('/profile')
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

    return(
      <Container component="main" sx={{width: '100%', bgcolor: 'background.paper'}}>
      <Tabs value={0} onChange={handleChange} centered>
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
          Create new work entry
        </Typography>
        <Box sx={{ 
          mt: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
        }}>
        <TextField
            type="number"
            placeholder="0"
            label="Duration minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            sx={{mb: 2}}
          />
          <TextField
            placeholder="Description"
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
        <Box>
          <Button
            type="submit"            
            variant="contained"
            sx={{ mt: 2, mb: 2 , mr: 1}}
            onClick={(e) => {
              e.preventDefault()
              createEntry(duration, description)
            }}
          >
            Save
          </Button>
        </Box>
      </Container>
    </Container>

      
    )


}