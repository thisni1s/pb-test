import React, { useEffect, useState } from 'react';
import { Typography, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';

import TopBar from '../components/TopBar';
import BotNavigation from '../components/BotNavigation';
import { Task, taskFromRecord } from '../models/Task';
import { WorkEntry, workEntryFromRecord } from '../models/WorkEntry';

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

  function getHistory() {
    return history
      .map(el => {return <Typography>Eintrag: Titel: {el[0].title} Beschreibung: {el[0].description} ID: {el[0].id} spend_minutes: {el[1].minutes}</Typography>;});
  }


  return (
    <>
      <TopBar username={pb.authStore.model?.username as string || 'X'} logout={handleLogout}/>
      <Container component='main' sx={{flexGrow: 1, mt: 10, mb: 5}}>
        <Typography>Hello World</Typography>
        {getHistory()}
      </Container>
      <BotNavigation value={1} moderator={pb.authStore.model?.moderator || false}/>
    </>
  );

}