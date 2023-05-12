import React, { useState, useEffect } from 'react'
import PocketBase, { type Record, type RecordSubscription } from 'pocketbase'
import { Fab, Container, Typography, LinearProgress, Divider } from '@mui/material'
import { Stack } from '@mui/system'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

import { type Task, taskFromRecord } from '../models/Task'
import TaskCard from '../components/TaskCard'
import NewTask from '../components/NewTask'
import BotNavigation from '../components/BotNavigation'
import TopBar from '../components/TopBar'
import config from '../config.json'

import AddIcon from '@mui/icons-material/Add'
import { type WorkEntry, workEntryFromRecord } from '../models/WorkEntry'
import { formatTime, getUsernameForUserid, sanitizeTime, arrayHasId, formatUploadTime, apiFinishTask, apiClaimTask } from '../helpers'

export default function Home() {
  const baseUrl = config.baseUrl
  const pb = new PocketBase(baseUrl)
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [wEntries, setWEntries] = useState<WorkEntry[]>([])
  const [newDia, setNewDia] = useState<boolean>(false)
  const [usernameDb, setUsernameDb] = useState<Map<string, string>>(new Map<string, string>())

  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate('/auth')
    }
    async function taskGet() {
      await initTasks()
      await initWEntries()
    }
    void taskGet()
  }, [])

  useEffect(() => {
    void pb.collection('tasks').subscribe('*', function (e: RecordSubscription<Record>) {
      handleEvent(e)
    })
    void pb.collection('work_entries').subscribe('*', function(e: RecordSubscription<Record>) {
      handleWEntryEvent(e)
    })
    return function cleanup() {
      void pb.collection('tasks').unsubscribe()
      void pb.collection('work_entries').unsubscribe()
    }
  }, [])

  pb.afterSend = function(response, data) {
    if (data.usernames !== undefined) {
      const db = new Map<string, string>()
      Object.keys(data.usernames).forEach(key => {
        db.set(key, data.usernames[key])
      })
      console.log('usernamedb: ', db)
      setUsernameDb(old => {
        db.forEach(function(value, key) {
          if (!old.has(key)) {
            old.set(key, value)
          }
        })
        return old
      })
    }
    return data
  }

  async function initTasks() {
    try {
      const time = moment().subtract(1, 'week')
      let taskList: any[] = await pb.collection('tasks').getFullList(200, {
        filter: `((private=true&&creator="${pb.authStore.model?.id ?? ''}")||private=false)&&((done=false)||(done=true&&updated>="${formatTime(time)}"))`,
        expand: 'creator,claimed'
      })
      taskList = taskList.map(task => {
        return {
          ...task,
          username: getUNamesWrapper(task.creator),
          image: task.image !== '' ? pb.getFileUrl(task, task.image, {'thumb': '512x512'}) : ''
        }
      })
      console.log(taskList)
      setTasks(taskList.map(task => taskFromRecord(task)))
    } catch (error) {
      console.log(error)
    }
  }

  async function initWEntries() {
    try {
      const time = moment().startOf('month').subtract(720, 'minutes')
      const records = await pb.collection('work_entries').getFullList(200, {
        filter: `created>="${formatTime(time)}"&&user="${pb.authStore.model?.id ?? ''}"`,
        sort: '-created'
      })
      // console.log('work entries: ', records);
      setWEntries(records.map(entry => workEntryFromRecord(entry)))
    } catch (error) {
      console.log(error)
    }
  }

  function handleEvent(event: RecordSubscription<Record>) {
    const changedTask = taskFromRecord({ ...event.record, username: getUNamesWrapper(event.record.creator ?? ''), image: event.record.image !== '' ? pb.getFileUrl(event.record, event.record.image, {'thumb': '512x512'}) : '' })
    if (!(changedTask.private === true && changedTask.creator !== pb.authStore.model?.id)) {
      console.log('i am listening, ', event)
      setTasks(prevstate => {
        switch (event.action) {
          case 'create':
            return [...prevstate, changedTask]
          case 'delete':
            return prevstate.filter(el => el.id !== event.record.id)
          case 'update':
            return arrayHasId(prevstate, changedTask) ? prevstate.map(el => el.id === event.record.id ? changedTask : el) : [...prevstate, changedTask]
          default:
            return prevstate
        }
      })
    } 
  }

  function handleWEntryEvent(event: RecordSubscription<Record>) {
    // console.log('i am listening, ', event);
    const changedEntry = workEntryFromRecord(event.record)
    if (changedEntry.user === pb.authStore.model?.id) {
      setWEntries(prevstate => {
        switch (event.action) {
          case 'create':
            return [...prevstate, changedEntry]
          case 'delete':
            return prevstate.filter(el => el.id !== event.record.id)
          case 'update':
            return prevstate.map(el => el.id === event.record.id ? changedEntry : el)
          default:
            return prevstate
        }
      })
    }
  }

  function handleLogout() {
    pb.authStore.clear()
    navigate('/auth')
  }

  function calcWTime(entries: WorkEntry[]) {
    let minutes = 0
    entries.forEach(entry => (minutes = minutes + entry.minutes))
    return minutes
  }

  async function deleteEntry(id: string) {
    try {
      if (id !== '') {
        await pb.collection('tasks').delete(id)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function createWorkEntry(entry: WorkEntry): Promise<boolean> {
    try {
      const data = {
        user: entry.user,
        task: entry.task,
        minutes: entry.minutes,
        date: entry.date
      }
      const record = await pb.collection('work_entries').create(data)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async function finishTask(id: string, duration: number, date: moment.Moment) {
    const task = tasks.find(el => el.id === id)
    const userid = pb.authStore.model?.id ?? ''
    if (task !== undefined && userid !== '') {
      if (!task.claimed.includes(userid)) {
        await apiClaimTask(task.id ?? '', pb.authStore.token)
      }
      await createWorkEntry(workEntryFromRecord({ user: userid, task: id, minutes: duration, date: formatUploadTime(date) }))
      await apiFinishTask(task.id ?? '', pb.authStore.token) // this call may be uneccessary if the task has already been done
    }
  }

  // this function adds the user to the claimed array or removes them if they are already in it
  async function claimTask(id: string) {
    const task = tasks.find(el => el.id === id)
    if (task !== undefined) {
      await apiClaimTask(task.id ?? '', pb.authStore.token)
    }
  }

  function getDoneOrClaimed(claimed: string[]) {
    // console.log('called');
    // console.log('claimed: ', claimed);
    const res = claimed.map(id => getUNamesWrapper(id))
    // console.log('res: ', res);
    return res
  }

  // async function changeVisibility(id: string) {
  //   const task = tasks.find(el => el.id === id)
  //   const userid = pb.authStore.model?.id ?? ''
  //   if (task !== undefined && userid !== '') {
  //     if(task.private) {
  //       task.private = false
  //     } else {
  //       task.private = true
  //     }
  //     await updateTask(task)
  //   }
  // }

  async function changeTask(taskid: string, body?: Object, formData?: FormData) {
    try {
      if(body !== undefined) {
        await pb.collection('tasks').update(taskid, body)
      }
      if(formData !== undefined) {
        await pb.collection('tasks').update(taskid, formData)
      }
    } catch (error) {
      console.log(error)
    }
  }

  function getFinishedByMe(taskid: string) {
    return wEntries.filter(entry => entry.task === taskid).length > 0
  }

  function getUNamesWrapper(id: string) {
    return getUsernameForUserid(id, usernameDb)
  }

  function getTaskCards(finished: boolean) {
    return finished
      ? tasks.filter(task => (task.done && !task.private))
        .map(task => { return { task, doneBy: getDoneOrClaimed(task.claimed), finishedByMe: getFinishedByMe(task.id ?? ''), creatorName: getUNamesWrapper(task.creator) } })
        .map(task => { return <TaskCard deleteEntry={deleteEntry} finish={finishTask} claim={claimTask} key={task.task.id ?? ''} task={task.task} userid={pb.authStore.model?.id ?? ''} creatorName={task.creatorName} doneClaimNames={task.doneBy} fByMe={task.finishedByMe} changeTask={changeTask} /> })
      : tasks.filter(task => !task.done)
        .map(task => { return { task, claimedBy: getDoneOrClaimed(task.claimed) } })
        .map(task => { return <TaskCard deleteEntry={deleteEntry} finish={finishTask} claim={claimTask} key={task.task.id ?? ''} task={task.task} userid={pb.authStore.model?.id ?? ''} creatorName={getUNamesWrapper(task.task.creator)} doneClaimNames={task.claimedBy} changeTask={changeTask} /> })
  }

  async function createEntry(data: Task): Promise<Task> {
    try {
      const record = await pb.collection('tasks').create(data)
      return taskFromRecord(record)
    } catch (error) {
      console.log(error)
      return taskFromRecord({})
    }
  }

  async function uploadEntryPicture(taskid: string, picture: Blob) {
    try {
      const formData = new FormData()
      formData.append('image', picture)
      await pb.collection('tasks').update(taskid, formData);
    } catch (error) {
      console.log(error)
    }
  }

  function openNewDia() {
    newDia ? setNewDia(false) : setNewDia(true)
  }

  return (
    <>
      <TopBar username={pb.authStore.model?.username as string ?? 'X'} logout={handleLogout}/>
      <Container component='main' sx={{ flexGrow: 1, mt: 10, mb: 5 }}>
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Container>
            <LinearProgress variant='determinate' value={(calcWTime(wEntries) / 240) * 100} />
            <Typography variant='caption' gutterBottom>
            Du hast bereits {sanitizeTime(calcWTime(wEntries))} von 4 Stunden diesen Monat gearbeitet.
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
        {<NewTask userid={pb.authStore.model?.id ?? ''} visible={newDia} setVisible={setNewDia} createEntry={createEntry} createWorkEntry={createWorkEntry} uploadPicture={uploadEntryPicture}/>}
      </Container>
      <Fab color='primary' aria-label='add' sx={{ position: 'fixed', bottom: 60, right: 20 }} onClick={openNewDia}>
          <AddIcon />
      </Fab>
      <BotNavigation value={0} moderator={pb.authStore.model?.moderator ?? false}/>
    </>
  )
}
