import { useState, useEffect, Fragment } from 'react'
import './App.css';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import { Fab, Tabs, Tab, Container, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, LinearProgress, IconButton } from '@mui/material';
import moment from 'moment';

import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import {useGlobulContext, useUpdateGlobulContext} from '../GlobulContext'

export default function Home() {
  const pb = new PocketBase('https://base.jn2p.de');
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [wtime, setWtime] = useState({val: 0, unit: 'day', worked: 0})
  const globulstate = useGlobulContext()
  useEffect(() => {
    async function getWorkEntries() {
      console.log('Call me maybe')
      try {
        const records = await pb.collection('work_entries').getFullList(10, {
          sort: '-created',
          filter: 'user="'+pb.authStore.model.id+'"',
        });
        setEntries(records)
      } catch (error) {
        console.log(error)
      }      
    }  

    getWorkEntries()
    getWorkTime()
    test()
  }, [])

  function test() {
    console.log(globulstate.globulContext)
    globulstate.updateContext({hello: true})
    console.log(globulstate.globulContext)
  }

  async function getWorkTime() {
    console.log('Call me maybe2')
    try {
      const record = await pb.collection('time_setting').getFirstListItem('user="'+pb.authStore.model.id+'"', {
        expand: 'relField1,relField2.subRelField',
      })
      console.log('1')
      //during the last month week day
      //let time = moment().subtract(record.time_val, record.unit)
      let time = moment().startOf(record.unit.substring(0, record.unit.length))
      time = time.format('YYYY-MM-DD hh:mm:ss')
      console.log('2')
      const record2 = await pb.collection('work_entries').getFullList(100, {
        filter: 'created >= "'+time+'" && user="'+pb.authStore.model.id+'"',
      });
      console.log('3')
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

    async function deleteEntry(id) {
      try {
        await pb.collection('work_entries').delete(id);
        const newEntries = entries.filter(e => e.id !== id)
        setEntries(newEntries)
        await getWorkTime()
      } catch (error) {
        console.log(error)
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
        case 3:
          navigate('/userOverview')
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
              secondaryAction={
                <IconButton
                 aria-label="delete"
                 onClick={() => deleteEntry(entry.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
              <Avatar>
              <AssignmentIcon />
              </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={entry.duration_min+' mins @ '+moment(entry.created).format('DD.MM.YYYY')} 
                secondary={entry.description}
              />
              
            </ListItem>
            <Divider variant="inset" component="li" />
            </>
          )
        } else {
          return (<></>)
        }
      })
  



    return(
    <Container component="main" sx={{width: '100%', bgcolor: 'background.paper'}}>
      <Tabs value={1} onChange={handleChange} centered>
        <Tab label="New Entry" />
        <Tab label="Home" />
        <Tab label="Profile" />
        <Tab label="Others" />
      </Tabs>
      <Container sx={{outlineWidth: '3pt', outlineColor: 'yellow'}}>
      <Typography variant="h5" gutterBottom>
          Your goal: {sanitizeTime(wtime.val)} per {wtime.unit.substring(0, wtime.unit.length - 1)}
        </Typography>
        <LinearProgress variant="determinate" value={(wtime.worked / wtime.val)*100} />
        <Typography variant="caption" gutterBottom>
          Already worked: {sanitizeTime(wtime.worked)} in this {wtime.unit.substring(0, wtime.unit.length - 1)}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{mt: 3}}>
          Your last entries:
        </Typography>
        <List>
          {listEntries}
        </List>
      </Container>
      <Fab color="primary" aria-label="add" /*sx={{ position: 'absolute',  bottom: 16,  right: 16,}}*/ sx={{float: 'right'}}>
        <AddIcon />
      </Fab>
    </Container>
    )


}