import React, { useEffect, useState } from 'react';
import { Typography, Container, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { useNavigate } from 'react-router-dom';
import PocketBase, { RecordSubscription, Record } from 'pocketbase';

import TopBar from '../components/TopBar';
import BotNavigation from '../components/BotNavigation';
import { Task, taskFromRecord } from '../models/Task';
import { WorkEntry, workEntryFromRecord } from '../models/WorkEntry';
import HistoryCard from '../components/HistoryCard';

type WTask = [Task, WorkEntry];

export default function History() {
  const baseurl = 'https://base.jn2p.de';
  const pb = new PocketBase(baseurl);
  const navigate = useNavigate();
  const [history, setHistory] = useState<WTask[]>([]);

  useEffect(() => {
    !pb.authStore.isValid ? navigate('/auth') : null
    async function historyGet() {
      await initHistory();
    }
    historyGet();
  }, []);

  function handleLogout() {
    pb.authStore.clear();
    navigate('/auth');
  }

  async function initHistory() {
    try {
      console.log(pb.authStore.model?.id)
      const historyList = await pb.collection('work_entries').getFullList(200, {
        filter: `user="${pb.authStore.model?.id}"`,
        expand: 'task',
        sort: '-updated',
      });
      const list: WTask[] = historyList.map(record => [taskFromRecord(record.expand.task), workEntryFromRecord(record)]);
      setHistory(list)
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteEntry(id: string) {
    try {
      const res = await pb.collection('work_entries').delete(id);
      res === true ? setHistory(prevstate => prevstate.filter(el => el[1].id !== id)) : null
    } catch (error) {
      alert('Löschen fehlgeschlagen!');
    }
  }

  async function changeEntry(entry: WorkEntry, newTime: number) {
    try {
      const data = {
        "minutes": newTime,
        "user": entry.user,
        "task": entry.task,
      }
      const record = await pb.collection('work_entries').update(entry.id || '', data);
      if (record !== undefined) {
        setHistory(prevstate => {
          return prevstate.map(el => {
            if (el[1].id === record.id) {
              return [el[0], workEntryFromRecord(record)]
            } else {
              return el
            }
          })
        })
      }
    } catch (error) {
      alert('Update fehlgeschlagen!');
    }

  }

  function getHistory() {
    return history
      .map(el => {return <HistoryCard task={el[0]} workEntry={el[1]} deleteEntry={deleteEntry} changeTime={changeEntry}/>});
  }


  return (
    <>
      <TopBar username={pb.authStore.model?.username as string || 'X'} logout={handleLogout}/>
      <Container component='main' sx={{flexGrow: 1, mt: 10, mb: 5}}>
        <Grid container spacing={2}>
          {getHistory()}
        </Grid>
      </Container>
      <BotNavigation value={1} moderator={pb.authStore.model?.moderator || false}/>
    </>
  );

}