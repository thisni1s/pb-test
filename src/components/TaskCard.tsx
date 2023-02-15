import React, {useState} from 'react';
import { Card, CardContent, Typography, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Task } from '../models/Task';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Props {
  key: string,
  userid: string,
  task: Task,
  deleteEntry: (id: string) => void,
  claim: (id: string) => void,
  finish: (id: string, duration: number) => void
}

export default function TaskCard({ key, userid, task, deleteEntry, claim, finish }: Props) {
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

    return (
      <Grid xs={12} md={4} key={key}>
        <Card>
          <CardContent>
            <Typography variant='h5' component='div'>
              {task.title}
            </Typography>
            <Typography variant='body2'>
              {task.description}
            </Typography>
            <Typography color='text.secondary' variant='caption' gutterBottom>
                By: {task.creator}
            </Typography>
            <Stack direction='row' spacing={2} sx={{display: 'flex', mt: 1}}>
              {
                task.claimed.length > 0 ? 
                  <Button disabled variant='outlined' size='small' sx={{flexGrow: 1}}>{task.claimed[0]}{task.claimed.length>1 ? +' u.a.' : ''}</Button>
                : 
                  <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={handleClaim}><AddIcon fontSize='small'/></Button>
              }                
              <Button variant='outlined' size='small' sx={{flexGrow: 1}} onClick={() => setDialog(true)}><CheckIcon fontSize='small'/></Button>
              {
                task.creator === userid ? <IconButton aria-label='delete' size='small' onClick={() => setDelDia(true)}><DeleteIcon fontSize='small'/></IconButton> : <></>
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