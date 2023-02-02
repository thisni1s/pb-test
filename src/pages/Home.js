import { useState, useEffect, Fragment } from 'react'
import './App.css';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import { TextField, Card, CardActions, CardContent, AppBar, Fab, Tabs, Tab, Container, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, LinearProgress, IconButton, Toolbar, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, BottomNavigation, BottomNavigationAction } from '@mui/material';
import moment from 'moment';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';

import {useGlobulContext, useUpdateGlobulContext} from '../GlobulContext'
import { Stack } from '@mui/system';

export default function Home() {
  const pb = new PocketBase('https://base.jn2p.de');
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [wtime, setWtime] = useState({val: 0, unit: 'day', worked: 0})
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
  }, [])

  const test_tasks = [
    {
      title: 'do stuff',
      description: 'do some very long stuff with the stuff and the stuff',
      by: 'Nils',
      claimed: '',
    },
    {
      title: 'do stuff',
      description: 'do some very long stuff with the stuff and the stuff',
      by: 'nini',
      claimed: 'Peter',
    }
  ]
  const [tasks, setTasks] = useState(test_tasks)

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
  
    const TaskCard = props => {
      const task = props.task
      const [dialog, setDialog] = useState(false)
      const [delDia, setDelDia] = useState(false)
      const [duration, setDuration] = useState(0)
      return (
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {task.title}
              </Typography>
              <Typography variant="body2">
                {task.description}
              </Typography>
              <Typography color="text.secondary" variant="caption" gutterBottom>
                By: {task.by}
              </Typography>
              <Stack direction="row" spacing={2} sx={{display: 'flex', mt: 1}}>
                {
                  task.claimed.length > 0 ? <Button diabled variant='outlined' size='small' sx={{flexGrow: 1, borderColor: 'GrayText', color: 'GrayText'}}>{task.claimed}</Button> : <Button variant='outlined' size='small' sx={{flexGrow: 1}}><AddIcon fontSize="small"/></Button>
                }                
                <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDialog(true)}><CheckIcon fontSize="small"/></Button>
                {
                  task.by === pb.authStore.model.username ? <IconButton aria-label="delete" size="small" onClick={() => setDelDia(true)}><DeleteIcon fontSize="small"/></IconButton> : <></>
                }
              </Stack>
              <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>
                {task.title}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Aufgabe als Erledigt markieren?
                  </DialogContentText>
                <TextField
                  type="number"
                  placeholder="0"
                  label="Arbeitszeit (Minuten)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  sx={{mb: 1, mt: 2}}
                />
                <DialogActions>
                  <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDialog(false)}>Abbrechen</Button>               
                  <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDialog(false)}>Speichern</Button>
                </DialogActions>
                </DialogContent>
              </Dialog>
              <Dialog open={delDia} onClose={() => setDelDia(false)}>
                <DialogTitle>Delete {task.title} ?</DialogTitle>
                <DialogActions>
                  <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDelDia(false)}>Löschen</Button>               
                  <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => {console.log('hello'); setDelDia(false); console.log(delDia)}}>Abbrechen</Button>
                </DialogActions>
              </Dialog>          
            </CardContent>
          </Card>
        </Grid>
      )

    }


    return(
    <>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
          Simple Time
        </Typography>
        <IconButton><Avatar>{Array.from(pb.authStore.model.username)[0]}</Avatar></IconButton>
      </Toolbar>        
    </AppBar>
    <Container component="main" sx={{flexGrow: 1}}>
      <Stack spacing={1} sx={{mt: 2}}>
        <Container>
          <LinearProgress variant="determinate" value={(wtime.worked / wtime.val)*100} />
          <Typography variant="caption" gutterBottom>
            Worked: {sanitizeTime(wtime.worked)} of {sanitizeTime(wtime.val)} this month
          </Typography>
        </Container>
        <Grid container spacing={2}>
          {tasks.map(task => {
            return <TaskCard task={task}/>
          })}
        </Grid>
      </Stack>      
      <Fab color="primary" aria-label="add" sx={{ position: 'absolute',  bottom: 60,  right: 20,}}>
        <AddIcon />
      </Fab>
    </Container>
    {/*<Tabs value={0} onChange={handleChange} sx={{ position: 'absolute', bottom: 0}} centered>
        <Tab label="Home" />
        <Tab label="History" />
        </Tabs>*/}
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation value={0} onChange={handleChange}>
        <BottomNavigationAction label="Home" icon={<InventoryIcon />} />
        <BottomNavigationAction label="History" icon={<HistoryIcon />} />      
      </BottomNavigation>
    </Paper>
    </>
    )


}