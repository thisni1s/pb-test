import React, { useEffect, useState } from 'react';
import { Typography, Container } from '@mui/material';
import PocketBase from 'pocketbase';

import TopBar from '../components/TopBar';
import BotNavigation from '../components/BotNavigation';
import { Task, taskFromRecord } from '../models/Task';



export default function History() {
  const baseurl = 'https://base.jn2p.de';
  const pb = new PocketBase(baseurl);
  const [history, setHistory] = useState<Task[]>([]);

  useEffect(() => {
    async function historyGet() {
      await initHistory();
    }
    historyGet();
  }, []);

  async function initHistory() {
    try {
      console.log(pb.authStore.model?.id)
      const historyList = await pb.collection('tasks').getFullList(200, {
        filter: `(claimed="${pb.authStore.model?.id}" && spend_minutes>=0)`,
        sort: '-updated',
      });
      setHistory(historyList.map(record => taskFromRecord(record)));
    } catch (error) {
      console.log(error);
    }
  }

  function getHistory() {
    return history
      .map(el => {return <Typography>Eintrag: Titel: {el.title} Beschreibung: {el.description} ID: {el.id} spend_minutes: {el.spend_minutes}</Typography>;});
  }


  return (
    <>
      <TopBar username={pb.authStore.model?.username as string || 'X'}/>
      <Container component='main' sx={{flexGrow: 1}}>
        <Typography>Hello World</Typography>
        {getHistory()}
      </Container>
      <BotNavigation value={1}/>
    </>
  );

}