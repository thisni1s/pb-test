import React, {useState} from 'react';
import { Card, CardContent, Typography, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Divider, ButtonGroup } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Task } from '../models/Task';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface Props {
  userid: string,
  task: Task,
  doneBy?: string[]
  fByMe?: boolean,
  deleteEntry: (id: string) => void,
  claim: (id: string) => void,
  finish: (id: string, duration: number) => void,
  getUNames: (id: string) => string,
}

export default function TaskCard({ userid, task, doneBy, fByMe, deleteEntry, claim, finish, getUNames }: Props) {
    const [dialog, setDialog] = useState<boolean>(false);
    const [delDia, setDelDia] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(0);

    function handleDelete() {
      deleteEntry(task.id || '');
      setDelDia(false);
    }

    function handleFinish() {
      finish(task.id || '', duration);
      setDialog(false);
    }

    function handleClaim() {
      claim(task.id || '');
    }

    function ClaimButton() {
      return (
        <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={handleClaim}>{!task.claimed.includes(userid) ? <AddIcon fontSize='small'/> : <RemoveIcon fontSize='small'/>}</Button>
      )
    }


    function AddClaim() {
      const claimedStrEnd = task.claimed.length > 1 ? ' u.a.' : ''
      const claimedStr = task.claimed[0] +  claimedStrEnd
      return (
        <ButtonGroup variant='outlined' aria-label='claim-button-group' size='small'>
          <Button disabled>{claimedStr}</Button>
          <ClaimButton/>
        </ButtonGroup>
      )
    }

    function unfinishedTask() {
      return (
        <Stack direction='row' spacing={2} sx={{display: 'flex', mt: 1}}>
          {
            task.claimed.length > 0 ? 
            <AddClaim/> 
            : 
            <ClaimButton/>  
          }                
          <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDialog(true)}><CheckIcon fontSize='small'/></Button>
          {
            task.creator === userid ? <IconButton aria-label='delete' size='small' onClick={() => setDelDia(true)}><DeleteIcon fontSize='small'/></IconButton> : <></>
          }
        </Stack>
      )
    }

    function finishedTask() {
      console.log('finished by me? ', fByMe)
      return (
        <>
        <br/>
        <Typography color='text.secondary' variant='caption' gutterBottom>Erledigt von: {doneBy?.join(', ')}</Typography>
        <Stack direction='row' spacing={2} sx={{display: 'flex', mt: 1}}>
          <Button disabled={fByMe} variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDialog(true)}>Zeit nachtragen</Button>
        </Stack>
        </>
      )
    }

    return (
      <Grid xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant='h5' component='div'>
              {task.title}
            </Typography>
            <Typography variant='body2'>
              {task.description}
            </Typography>
            <Typography color='text.secondary' variant='caption'>
                Erstellt: {task.username}
            </Typography>
            {!task.done ? unfinishedTask() : finishedTask()}
            <Dialog open={dialog} onClose={() => setDialog(false)}>
              <DialogTitle>
                {task.title}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                    Aufgabe als Erledigt markieren?
                </DialogContentText>
                <TextField
                  type='number'
                  placeholder='0'
                  label='Arbeitszeit (Minuten)'
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  sx={{mb: 1, mt: 2}}
                />
                <DialogActions>
                  <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDialog(false)}>Abbrechen</Button>               
                  <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={handleFinish}>Speichern</Button>
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