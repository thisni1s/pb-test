import { useState, useEffect, Fragment } from 'react'
import './App.css';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import { Tabs, Tab, Container, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, LinearProgress, IconButton } from '@mui/material';
import moment from 'moment';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function UserOverview() {
  const pb = new PocketBase('https://base.jn2p.de');
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [wtime, setWtime] = useState({val: 0, unit: 'day', worked: 0})
  useEffect(() => {
    async function getUsersWithHours() {
      await getWorkTime()
      try {
        const users = await pb.collection('users').getFullList(200, {
          sort: '-created',
        });
        console.log('got users')
        let usertimes = []
        let timescale = moment().subtract(wtime.val, wtime.unit)
        timescale = timescale.format('YYYY-MM-DD hh:mm:ss')

        for (let i = 0; i < users.length; i++) {
          if (users[i].id !== pb.authStore.model.id){

          const records = await pb.collection('work_entries').getFullList(100, {
            sort: '-created',
            filter: 'created >= "'+timescale+'" && user="'+users[i].id+'"',
          });
          console.log('got times for user: ', users[i].username)
          let time = 0
          records.forEach(element => {
            console.log('time: '+element.duration_min)
            time = time+element.duration_min
          });
          usertimes = [
            ...usertimes,
            {
              id: users[i].id,
              username: users[i].username,
              time: time,
            }
          ]
        }
        }
        setEntries(usertimes)      
      } catch (error) {
        console.log(error)
      }      
    } 
    getUsersWithHours()
    
  }, [])

  async function getWorkTime() {
    try {
      const record = await pb.collection('time_setting').getFirstListItem('user="'+pb.authStore.model.id+'"', {
        expand: 'relField1,relField2.subRelField',
      })
      let time = moment().subtract(record.time_val, record.unit)
      time = time.format('YYYY-MM-DD hh:mm:ss')
      const record2 = await pb.collection('work_entries').getFullList(100, {
        filter: 'created >= "'+time+'" && user="'+pb.authStore.model.id+'"',
      });
      let minutes = 0
      record2.forEach(element => {
        minutes = minutes + element.duration_min
      });
      setWtime({val: record.time_val, unit: record.unit, worked: minutes})
    } catch (error) {
      console.log(error)
    }        
  }


    function sanitizeTime(mins) {
      if (mins < 60) {
        return mins+' minutes'
      } else {
        return Math.round((mins/60) *100)/100+' hours'
      }
    }

    const handleChange = (event, newValue) => {
      console.log('nw: '+newValue)
      switch(newValue) {
        case 2:
          navigate('/Profile')
          break
        case 0:
          navigate('/newEntry')
          break
        default:
          break
      }
    };

    const listEntries = entries.map((entry)=>{
        if (entry !== undefined) {
          return (
            <>
            <ListItem
              key={entry.id}
              alignItems='flex-start'
              
            >
              <ListItemAvatar>
                <Avatar>
                  <AccountCircleIcon  />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={entry.username} 
                secondary={sanitizeTime(entry.time)+' this '+wtime.unit.substring(0, wtime.unit.length-1)}
              />
              
            </ListItem>
            <LinearProgress variant="determinate" value={(entry.time / wtime.val)*100} />
            </>
          )
        } else {
          return (<></>)
        }
      })
  



    return(
    <Container component="main" sx={{width: '100%', bgcolor: 'background.paper'}}>
      <Tabs value={3} onChange={handleChange} centered>
        <Tab label="New Entry" />
        <Tab label="Home" />
        <Tab label="Profile" />
        <Tab label="Others" />
      </Tabs>
      <Container>
      <Typography variant="h5" gutterBottom>
          Your goal: {sanitizeTime(wtime.val)} per {wtime.unit.substring(0, wtime.unit.length - 1)}
        </Typography>
        <LinearProgress variant="determinate" value={(wtime.worked / wtime.val)*100} />
        <Typography variant="caption" gutterBottom>
          Already worked: {sanitizeTime(wtime.worked)} in the last {wtime.unit.substring(0, wtime.unit.length - 1)}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{mt: 3}}>
          Other users:
        </Typography>
        <List>
          {listEntries}
        </List>
      </Container>
    </Container>
    )


}