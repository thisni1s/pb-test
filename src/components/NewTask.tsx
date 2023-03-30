import React, { useState } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Typography, Button, Stack, TextField, Switch } from '@mui/material';
import { Task } from '../models/Task';
import CloseIcon from '@mui/icons-material/Close';
import { WorkEntry } from '../models/WorkEntry';


interface Props {
    userid: string,
    visible: boolean
    setVisible: (state: boolean) => void,
    createEntry: (data: Task) => Promise<Task>,
    createWorkEntry: (data: WorkEntry) => Promise<boolean>,
}

export default function NewTask({ userid, visible, setVisible, createEntry, createWorkEntry }: Props ) {
    const [title, setTitle] = useState<string>('');
    const [description, setDiscription] = useState<string>('');
    const [spendMin, setSpendMin] = useState<number>(0);
    const [done, setDone] = useState<boolean>(false);
    const [claim, setClaim] = useState<boolean>(false);

    async function handleClose(save: boolean) {
      console.log('close!!!', save);
      if (save) {
        //sanity checks
        if(title.length === 0 || (done && spendMin <= 0)) {
          alert('Titel muss gesetzt sein. Wenn die Aufgabe schon erledigt ist muss eine Dauer angegeben werden die größer 0 ist!');
        } else {
            const data = {
                'creator': userid,
                'claimed': (claim || done) ? [userid] : [],
                'title': title,
                'description': description,
                'done': done,
            } as Task;  
          const task = await createEntry(data);
          if(task.id !== '' && task !== undefined && done) {
            await createWorkEntry({'user': userid, 'task': task.id || '', 'minutes': spendMin, 'date': ''});
          }
          task.id == undefined ? alert('error creating task') : null;
          setVisible(false);
          resetState();
        }
      } else {
        setVisible(false);
        resetState();
        console.log('visible is false');
      }        
    }

    function resetState() {
      setTitle('');
      setDiscription('');
      setSpendMin(0);
      setDone(false);
      setClaim(false);
    }

    return (
      <Dialog fullScreen open={visible} onClose={() => handleClose(false)}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge='start'
              color='inherit'
              onClick={() => handleClose(false)}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              Neue Aufgabe erstellen
            </Typography>
            <Button autoFocus color='inherit' onClick={() => handleClose(true)}>
              Speichern
            </Button>
          </Toolbar>
        </AppBar>
        <Stack spacing={2} sx={{mt: 2, ml: 2, mr: 2, display: 'flex'}}>
          <TextField
            placeholder='Titel'
            label='Titel'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            placeholder='Description'
            label='Description'
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDiscription(e.target.value)}
          />
          <Stack direction='row' sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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
                type='number'
                placeholder='0'
                label='Duration minutes'
                value={spendMin}
                onChange={(e) => setSpendMin(Number(e.target.value))}
                sx={{mb: 2}}
              />
              :
              <Stack direction='row' sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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

}