import React, { useState, useEffect } from 'react';
import PocketBase, { Record, RecordSubscription } from 'pocketbase';
import { Fab, Container, Typography, LinearProgress, Divider, Dialog } from '@mui/material';
import { Stack } from '@mui/system';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import moment, { min } from 'moment';

import { Task, taskFromRecord } from '../models/Task';
import TaskCard from '../components/TaskCard';
import NewTask from '../components/NewTask';
import BotNavigation from '../components/BotNavigation';
import TopBar from '../components/TopBar';

import AddIcon from '@mui/icons-material/Add';
import { WorkEntry, workEntryFromRecord } from '../models/WorkEntry';


export default function Home() {
  const baseurl = 'https://base.jn2p.de';
  const pb = new PocketBase(baseurl);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [wEntries, setWEntries] = useState<WorkEntry[]>([]);
  const [newDia, setNewDia] = useState<boolean>(false);

  useEffect(() => {
    async function taskGet() {
      await initTasks();
      await initWEntries();
    }
    taskGet();
  }, []);

  useEffect(() => {
    pb.collection('tasks').subscribe('*', function (e: RecordSubscription<Record>) {
      handleEvent(e);
    });
    pb.collection('work_entries').subscribe('*', function(e: RecordSubscription<Record>) {
      handleWEntryEvent(e);
    })
    return function cleanup() {
      pb.collection('tasks').unsubscribe();
      pb.collection('work_entries').unsubscribe();
    };
  }, []);
  
  async function initTasks() {
    try {
      const time = moment().subtract(1, 'week');
      const timeStr = time.format('YYYY-MM-DD hh:mm:ss');
      let taskList: any[] = await pb.collection('tasks').getFullList(200, {
        filter: '(done=false)||(done=true&&updated>="'+timeStr+'")',
        expand: 'creator,claimed'
      });
      taskList = taskList.map(task => {
        return {
          ...task,
          username: getUsernameForUserid(task.creator)
        }
      })
      setTasks(taskList.map(task => taskFromRecord(task)));
    } catch (error) {
      console.log(error);
    }
  }

  async function initWEntries() {
    try {
      const time = moment().subtract(1, 'month');
      const timeStr = time.format('YYYY-MM-DD hh:mm:ss');
      const records = await pb.collection('work_entries').getFullList(200 , {
        filter: `created>="${timeStr}"`,
        sort: '-created',
      });
      console.log('work entries: ', records)
      setWEntries(records.map(entry => workEntryFromRecord(entry)));
    } catch (error) {
      console.log(error)
    }    
  }
  
  function getUsernameForUserid(id: string) {
    //return await apicallGet('GET', baseurl+'/api/st_users/'+id, pb.authStore.token)
    return id;
  }

  function handleEvent(event: RecordSubscription<Record>) {
    const changedTask = taskFromRecord({...event.record, username: getUsernameForUserid(event.record.creator || '')})
    console.log('i am listening, ', event);
    setTasks(prevstate => {
      switch (event.action) {
      case 'create':
        return [...prevstate, changedTask];
      case 'delete':
        return prevstate.filter(el => el.id !== event.record.id);
      case 'update':
        return prevstate.map(el => el.id === event.record.id ? changedTask : el);      
      default:
        return prevstate;
      }
    });
  }

  function handleWEntryEvent(event: RecordSubscription<Record>) {
    const changedEntry = workEntryFromRecord(event.record)
    console.log('i am listening, ', event);
    setWEntries(prevstate => {
      switch (event.action) {
      case 'create':
        return [...prevstate, changedEntry];
      case 'delete':
        return prevstate.filter(el => el.id !== event.record.id);
      case 'update':
        return prevstate.map(el => el.id === event.record.id ? changedEntry : el);      
      default:
        return prevstate;
      }
    });
  }

  function calcWTime(entries: WorkEntry[]) {
    let minutes = 0;
    entries.forEach(entry => minutes = minutes + entry.minutes);
    return minutes;     
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

  async function updateTask(task: Task) {
    if(task.id !== undefined) {
      try {
        await pb.collection('tasks').update(task.id, task);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function createWorkEntry(entry: WorkEntry): Promise<boolean>{
    try {
      const data = {
        "user": entry.user,
        "task": entry.task,
        "minutes": entry.minutes,
      }
      const record = await pb.collection('work_entries').create(data);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function finishTask(id: string, duration: number) {
    const task = tasks.find(el => el.id === id);
    const userid = pb.authStore.model?.id || '';
    if (task !== undefined && userid !== '') {
      !task.claimed.includes(userid) ? task.claimed.push(userid) : task
      task.done = true;
      await createWorkEntry(workEntryFromRecord({'user': userid, 'task': id, 'minutes': duration}));
      await updateTask(task); // this call may be uneccessary if the task has already been done and the user is already in the claimed array
    }    
  }

  //this function adds the user to the claimed array or removes them if they are already in it
  async function claimTask(id: string) {
    const task = tasks.find(el => el.id === id);
    const userid = pb.authStore.model?.id || '';
    if (task !== undefined && userid !== '') {
      if(task.claimed.includes(userid)){
        task.claimed = task.claimed.filter(user => user !== userid)
      } else {
        task.claimed.push(userid)
      }
      await updateTask(task);
    }
  }

  function getDoneBy(claimed: string[]) {
    return claimed.map(id => getUsernameForUserid(id))
  }

  function getFinishedByMe(taskid: string) {
    return wEntries.filter(entry => entry.task === taskid).length > 0 ? true : false
  }

  function getTaskCards(finished: boolean) {
    return finished ?
      tasks.filter(task => task.done === true)
      .map(task => {return {task: task, doneBy: getDoneBy(task.claimed), finishedByMe: getFinishedByMe(task.id || '')}})
      .map(task => {return <TaskCard deleteEntry={deleteEntry} finish={finishTask} claim={claimTask} getUNames={getUsernameForUserid} key={task.task.id || ''} task={task.task} userid={pb.authStore.model?.id || ''} doneBy={task.doneBy} fByMe={task.finishedByMe}/>;})
    :
      tasks.filter(task => task.done === false)
      .map(task => {return <TaskCard deleteEntry={deleteEntry} finish={finishTask} claim={claimTask} getUNames={getUsernameForUserid} key={task.id || ''} task={task} userid={pb.authStore.model?.id || ''} />;});

  }

  async function createEntry(data: Task): Promise<Task> {
    try {
      const record = await pb.collection('tasks').create(data);
      return taskFromRecord(record);        
    } catch (error) {
      console.log(error);
      return taskFromRecord({});
    }
  }

  function openNewDia() {
    console.log('open new dia');
    newDia? setNewDia(false) : setNewDia(true)
    console.log('opened');
  }

  return(
    <>
      <TopBar username={pb.authStore.model?.username as string || 'X'}/>
      <Container component='main' sx={{flexGrow: 1}}>
        <Stack spacing={1} sx={{mt: 2}}>
          <Container>
            <LinearProgress variant='determinate' value={(calcWTime(wEntries) / 240)*100} />
            <Typography variant='caption' gutterBottom>
            Worked: {sanitizeTime(calcWTime(wEntries))} of 4 hours this month
            </Typography>
          </Container>
          <Grid container spacing={2}>
            {getTaskCards(false)}
          </Grid>
          <Divider>Bereits abgeschlossene Aufgaben</Divider>
          <Grid container spacing={2}>
            {getTaskCards(true)}
          </Grid>
        </Stack>
        {<NewTask userid={pb.authStore.model?.id || ''} visible={newDia} setVisible={setNewDia} createEntry={createEntry} createWorkEntry={createWorkEntry}/>} 
        <Fab color='primary' aria-label='add' sx={{ position: 'absolute',  bottom: 60,  right: 20,}} onClick={openNewDia}>
          <AddIcon />
        </Fab>
      </Container>
      <BotNavigation value={0}/>
    </>
  );
}