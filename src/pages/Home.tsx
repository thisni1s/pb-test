import React, { useState, useEffect } from 'react';
import PocketBase, { Record, RecordSubscription } from 'pocketbase';
import { Fab, Container, Typography, LinearProgress } from '@mui/material';
import { Stack } from '@mui/system';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import { Task } from '../models/Task';
import TaskCard from '../components/TaskCard';
import NewTask from '../components/NewTask';
import BotNavigation from '../components/BotNavigation';
import TopBar from '../components/TopBar';

import AddIcon from '@mui/icons-material/Add';


export default function Home() {
  const baseurl = 'https://base.jn2p.de';
  const pb = new PocketBase(baseurl);
  const [wtime, setWtime] = useState({val: 0, unit: 'day', worked: 0});
  const [tasks, setTasks] = useState<any[]>([]);
  const [newDia, setNewDia] = useState<boolean>(false);
  useEffect(() => {
    async function taskGet() {
      await initTasks();
    }
    taskGet();
  }, []);

  useEffect(() => {
    pb.collection('tasks').subscribe('*', function (e: RecordSubscription<Record>) {
      handleEvent(e);
    });
    return function cleanup() {
      pb.collection('tasks').unsubscribe();
    };
  }, []);
  
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
  
  async function getUsernameForUserid(id: string) {
    //return await apicallGet('GET', baseurl+'/api/st_users/'+id, pb.authStore.token)
    return id;
  }

  function handleEvent(event: RecordSubscription<Record>) {
    console.log('i am listening, ', event);
    setTasks(prevstate => {
      const missingData: Record = prevstate[0];
      switch (event.action) {
      case 'create':
        return [...prevstate, { username: 'testUser', ...event.record, ...missingData}];
      case 'delete':
        return prevstate.filter(el => el.id !== event.record.id);
      case 'update':
        return prevstate.map(el => el.id === event.record.id ? { username: el.username, ...event.record,  ...missingData}: el);      
      default:
        return prevstate;
      }
    });
  }

  function sanitizeTime(mins : number) {
    if (mins < 60) {
      return mins+' minutes';
    } else {
      return Math.round((mins/60) *100)/100+' hours';
    }
  }

  async function deleteEntry(id: string) {
    try {
      id != '' ? await pb.collection('tasks').delete(id) : null;
    } catch (error) {
      console.log(error);
    }      
  }

  function getTaskCards() {
    return tasks
      .filter(task => task.spend_minutes === 0)
      .map(task => {return <TaskCard deleteEntry={deleteEntry} key={task.id} task={task} userid={pb.authStore.model?.id || ''} />;});
  }

  async function createEntry(data: Task): Promise<boolean> {
    try {
      const record = await pb.collection('tasks').create(data);
      return true;        
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  return(
    <>
      <TopBar username={pb.authStore.model?.username as string || 'X'}/>
      <Container component='main' sx={{flexGrow: 1}}>
        <Stack spacing={1} sx={{mt: 2}}>
          <Container>
            <LinearProgress variant='determinate' value={(wtime.worked / wtime.val)*100} />
            <Typography variant='caption' gutterBottom>
            Worked: {sanitizeTime(wtime.worked)} of {sanitizeTime(wtime.val)} this month
            </Typography>
          </Container>
          <Grid container spacing={2}>
            {getTaskCards()}
          </Grid>
        </Stack>
        <NewTask userid={pb.authStore.model?.id || ''} visible={newDia} setVisible={setNewDia} createEntry={createEntry}/>      
        <Fab color='primary' aria-label='add' sx={{ position: 'absolute',  bottom: 60,  right: 20,}} onClick={() => setNewDia(true)}>
          <AddIcon />
        </Fab>
      </Container>
      <BotNavigation value={0}/>
    </>
  );
}