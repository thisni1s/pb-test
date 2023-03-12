import React, { useEffect, useState } from 'react';
import { Typography, Container, Stack, Table, TableCell, TableBody, TableContainer, TableRow, TableHead, Paper, Toolbar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import moment from 'moment';

import TopBar from '../components/TopBar';
import BotNavigation from '../components/BotNavigation';
import { Task, taskFromRecord } from '../models/Task';
import { WorkEntry, workEntryFromRecord } from '../models/WorkEntry';
import { formatTime, getUsernameForUserid, sanitizeTime } from '../helpers';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListIcon from '@mui/icons-material/List';
import UserWorkInfo from '../components/UserWorkInfo';

type WTask = [Task, WorkEntry];
type User = {id: string, username: string}
type UserEntries = [User, WTask[]]

export default function Statistics() {
  const baseurl = 'https://base.jn2p.de';
  const pb = new PocketBase(baseurl);
  const navigate = useNavigate();
  const [userEntries, setUserEntries] = useState<Map<string, WTask[]>>();
  const [offset, setOffset] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    !pb.authStore.isValid ? navigate('/auth') : null;
    !pb.authStore.model?.moderator ? navigate('/home') : null;
    console.log('statistics!');
    getMonthHistory();
  }, []);

  useEffect(() => {
    getMonthHistory();
  }, [offset])

  function handleLogout() {
    pb.authStore.clear();
    navigate('/auth');
  }

  async function getMonthHistory() {
    try {
      const start = moment().startOf('month').subtract(offset, 'month');
      const end = moment().endOf('month').subtract(offset, 'month');
      const historyList = await pb.collection('work_entries').getFullList(200, {
        filter: `created>"${formatTime(start)}"&&created<"${formatTime(end)}"`,
        expand: 'task',
        sort: '-updated',
      });
      const list: WTask[] = historyList.map(record => [taskFromRecord(record.expand.task), workEntryFromRecord(record)]);
      let userHours = new Map<string, WTask[]>();
      for(const entry of list) {
          const old = userHours.get(entry[1].user);
          userHours.set(entry[1].user, old !== undefined ? [...old, entry] : [entry]);
      }
      setUserEntries(userHours);
    } catch (error) {
      console.log(error);
    }
  }

  function getHistory() {
    const ret: JSX.Element[] = [];
    userEntries?.forEach((val, key) => {
        let time = 0;
        val.forEach(entry => time = time + entry[1].minutes);
        ret.push(
            <TableRow>
                <TableCell>{getUsernameForUserid(key, pb.authStore.model?.id)}</TableCell>
                <TableCell>{key}</TableCell>
                <TableCell>{sanitizeTime(time)}</TableCell>
                <TableCell>{Math.round((time/240)*100)}</TableCell>
                <TableCell><IconButton onClick={() => {setSelectedUser(key); setUserInfo(true);}}><ListIcon/></IconButton></TableCell>
            </TableRow>
        );
    });
    return ret;
  }

  function setModalVisibility(state: boolean) {
    setUserInfo(state);
  }

  return (
    <>
      <TopBar username={pb.authStore.model?.username as string || 'X'} logout={handleLogout}/>
      <Container component='main' sx={{flexGrow: 1, mt: 10, mb: 5}}>
        <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
        <Toolbar>
            <IconButton onClick={() => setOffset(prevstate => prevstate+1)}><ChevronLeftIcon/></IconButton>
            <Typography sx={{flexGrow: 1, textAlign: 'center'}}>{moment().subtract(offset, 'month').format("MMMM YYYY")}</Typography>
            <IconButton onClick={() => setOffset(prevstate => prevstate-1)}><ChevronRightIcon/></IconButton>
        </Toolbar>
        <Table sx={{}} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Userid</TableCell>
            <TableCell>Zeit</TableCell>
            <TableCell>%</TableCell>
            <TableCell>Info</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {getHistory()}
        </TableBody>
      </Table>
    </TableContainer>
    <UserWorkInfo visible={userInfo} setVisible={setModalVisibility} userid={selectedUser}/>
    </Paper>
      </Container>
      <BotNavigation value={2} moderator={pb.authStore.model?.moderator || false}/>
    </>
  );

}