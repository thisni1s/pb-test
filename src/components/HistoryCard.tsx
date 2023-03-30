import React, {useState} from 'react';
import { Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, CardActions } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Task } from '../models/Task';
import { NumericFormat } from 'react-number-format';

import { WorkEntry } from '../models/WorkEntry';
import { readableTime, sanitizeTime } from '../helpers';

interface Props {
  task: Task,
  workEntry: WorkEntry,
  deleteEntry: (id: string) => void,
  changeTime: (entry: WorkEntry, newTime: number) => void,
}

export default function HistoryCard({ task, workEntry,  deleteEntry, changeTime }: Props) {
    const [dialog, setDialog] = useState<boolean>(false);
    const [timeDialog, setTimeDialog] = useState<boolean>(false);
    const [duration, setDuration] = useState(workEntry.minutes);

    function handleDelete() {
      deleteEntry(workEntry.id || '');
      setDialog(false);
    }

    function handleTimeChange() {
        changeTime(workEntry, duration);
        setTimeDialog(false);
    }

    function delDia() {
        return (
            <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>
                    "{task.title}" Löschen?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Diesen Eintrag wirklich löschen? Dies kann nicht rückgängig gemacht werden! 
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' size='small' onClick={() => setDialog(false)}>Abbrechen</Button>               
                    <Button variant='outlined' size='small' onClick={handleDelete}>Löschen</Button>
                </DialogActions>
            </Dialog>      
        )
    }

    function changeDia() {
        return (
            <Dialog open={timeDialog} onClose={() => setTimeDialog(false)}>
                <DialogTitle>
                     Zeit für Aufgabe "{task.title}" ändern
                </DialogTitle>
                <DialogContent>
                    <NumericFormat
                        customInput={TextField}
                        onValueChange={(values) => setDuration(Number(values.value))}
                        value={duration}
                        // you can define additional custom props that are all forwarded to the customInput e. g.
                        label='Neue Zeit:'
                        variant="outlined"
                        sx={{mt: 1}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' size='small' onClick={() => setTimeDialog(false)}>Abbrechen</Button>               
                    <Button variant='outlined' size='small' onClick={handleTimeChange}>Speichern</Button>
                </DialogActions>
            </Dialog>      
        )
    }

    return (
      <Grid xs={12} md={4}>      
        <Card>
          <CardContent>
            <Typography variant='h5'>
              {task.title}
            </Typography>
            <Typography variant='body2' color="text.secondary">
              {task.description}
            </Typography>
            <Typography variant='body2' color="text.secondary">
              Erledigt am: {readableTime(workEntry.date)}
            </Typography>
            <Typography variant='body2' color="text.secondary">
              Gearbeitete Zeit: {sanitizeTime(workEntry.minutes)}
            </Typography>         
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => setDialog(true)}>Löschen</Button>
            <Button size="small" onClick={() => setTimeDialog(true)}>Zeit ändern</Button>             
          </CardActions>
             {delDia()}
             {changeDia()}
        </Card>
      </Grid>  
    );

  };