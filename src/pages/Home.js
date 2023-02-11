import { useState, useEffect, React } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import { Switch, TextField, Card, CardContent, AppBar, Fab, Container, Avatar, Typography, LinearProgress, IconButton, Toolbar, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, BottomNavigation, BottomNavigationAction } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloseIcon from '@mui/icons-material/Close';

import { Stack } from '@mui/system';

export default function Home() {
  const baseurl = 'https://base.jn2p.de';
  const pb = new PocketBase(baseurl);
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [wtime, setWtime] = useState({val: 0, unit: 'day', worked: 0});
  const [tasks, setTasks] = useState([]);
  const [newDia, setNewDia] = useState(false);
  useEffect(() => {
    async function taskGet() {
      await initTasks();
    }
    taskGet();
  }, []);

  useEffect(() => {
    pb.collection('tasks').subscribe('*', function (e) {
      handleEvent(e);
    });
    return function cleanup() {
      pb.collection('tasks').unsubscribe();
    };
  }, []);

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
  ];
  async function getWorkTime() {
    //TODO      
  }

  async function initTasks() {
    try {
      const taskList = await pb.collection('tasks').getFullList(200, {
        filter: 'spend_minutes=0',
        expand: 'creator,claimed'
      });
      taskList.map(async task => {
        return {
          ...task,
          username: await getUsernameForUserid(task.creator)
        };
      });
      setTasks(taskList);
    } catch (error) {
      console.log(error);
    }
  }

  async function getUsernameForUserid(id) {
    //return await apicallGet('GET', baseurl+'/api/st_users/'+id, pb.authStore.token)
    return id;
  }

  function handleEvent(event) {
    console.log('i am listening, ', event);
    setTasks(prevstate => {
      switch (event.action) {
      case 'create':
        return [...prevstate, { ...event.record, username: 'testUser'}];
      case 'delete':
        return prevstate.filter(el => el.id !== event.record.id);
      case 'update':
        return prevstate.map(el => el.id === event.record.id ? { ...event.record, username: el.username } : el);      
      default:
        return prevstate;
      }
    });
  }

  function sanitizeTime(mins) {
    if (mins < 60) {
      return mins+' minutes';
    } else {
      return Math.round((mins/60) *100)/100+' hours';
    }
  }

  async function deleteEntry(id) {
    try {
      await pb.collection('tasks').delete(id);
    } catch (error) {
      console.log(error);
    }      
  }

  const handleChange = (event, newValue) => {
    console.log('nw: '+newValue);
    switch(newValue) {
    case 1:
      alert('not implemented!');
      break;
    case 0:
      break;
    default:
      break;
    }
  };

  const TaskCard = props => {
    const task = props.task;
    const [dialog, setDialog] = useState(false);
    const [delDia, setDelDia] = useState(false);
    const [duration, setDuration] = useState(0);

    function handleDelete() {
      deleteEntry(task.id);
      setDelDia(false);
    }

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
                By: {task.creator}
            </Typography>
            <Stack direction="row" spacing={2} sx={{display: 'flex', mt: 1}}>
              {
                task.claimed.length > 0 ? <Button disabled variant='outlined' size='small' sx={{flexGrow: 1}}>{task.claimed}</Button> : <Button variant='outlined' size='small' sx={{flexGrow: 1}}><AddIcon fontSize="small"/></Button>
              }                
              <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDialog(true)}><CheckIcon fontSize="small"/></Button>
              {
                task.creator === pb.authStore.model.id ? <IconButton aria-label="delete" size="small" onClick={() => setDelDia(true)}><DeleteIcon fontSize="small"/></IconButton> : <></>
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
                <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => {handleDelete();}}>Löschen</Button>               
                <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => {setDelDia(false);}}>Abbrechen</Button>
              </DialogActions>
            </Dialog>          
          </CardContent>
        </Card>
      </Grid>
    );

  };

  const NewTask = props => {
    const [title, setTitle] = useState('');
    const [description, setDiscription] = useState('');
    const [spendMin, setSpendMin] = useState(0);
    const [done, setDone] = useState(false);
    const [claim, setClaim] = useState(false);

    async function handleClose(save) {
      if (save) {
        //sanity checks
        if(title.length === 0 || (done && spendMin <= 0)) {
          alert('Titel muss gesetzt sein. Wenn die Aufgabe schon erledigt ist muss eine Dauer angegeben werden die größer 0 ist!');
        } else {
          try {
            const data = {
              'creator': pb.authStore.model.id,
              'claimed': (claim || done) ? pb.authStore.model.id : '',
              'title': title,
              'description': description,
              'spend_minutes': spendMin
            };
            const record = await pb.collection('tasks').create(data);              
          } catch (error) {
            console.log(error);
            alert('error creating task');
            //setNewDia(false)
          }
          setNewDia(false);
        }
      } else {
        setNewDia(false);
      }
        
    }

    return (
      <Dialog fullScreen open={newDia} onClose={() => handleClose(false)}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => handleClose(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Neue Aufgabe erstellen
            </Typography>
            <Button autoFocus color="inherit" onClick={() => handleClose(true)}>
              Speichern
            </Button>
          </Toolbar>
        </AppBar>
        <Stack spacing={2} sx={{mt: 2, ml: 2, mr: 2, display: 'flex'}}>
          <TextField
            placeholder="Titel"
            label="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            placeholder="Description"
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDiscription(e.target.value)}
          />
          <Stack direction="row" sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Typography sx={{flexGrow: 1}}>Aufgabe ist bereits Erledigt</Typography>
            <Switch
              checked={done}
              onChange={(e) => setDone(e.target.checked)}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Stack>
          {
            done ? 
              <TextField
                type="number"
                placeholder="0"
                label="Duration minutes"
                value={spendMin}
                onChange={(e) => setSpendMin(e.target.value)}
                sx={{mb: 2}}
              />
              :
              <Stack direction="row" sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Typography sx={{flexGrow: 1}}>Aufgabe für mich vormerken?</Typography>
                <Switch
                  checked={claim}
                  onChange={(e) => setClaim(e.target.checked)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Stack>
          }          
        </Stack>
      </Dialog>
    );

  };
    

  function getTaskCards() {
    return tasks
      .filter(task => task.spend_minutes === 0)
      .map(task => {return <TaskCard key={task.id} task={task}/>;});
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
            {getTaskCards()}
          </Grid>
        </Stack>
        <NewTask/>      
        <Fab color="primary" aria-label="add" sx={{ position: 'absolute',  bottom: 60,  right: 20,}} onClick={() => setNewDia(true)}>
          <AddIcon />
        </Fab>
      </Container>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation value={0} onChange={handleChange}>
          <BottomNavigationAction label="Home" icon={<InventoryIcon />} />
          <BottomNavigationAction label="History" icon={<HistoryIcon />} />      
        </BottomNavigation>
      </Paper>
    </>
  );


}