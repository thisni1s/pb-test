import React, { useState } from 'react'
import { Card, CardContent, CardMedia, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, CardActions, Stack, Chip } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import { type Task } from '../models/Task'
import { NumericFormat } from 'react-number-format'

import { type WorkEntry } from '../models/WorkEntry'
import { parseUploadTime, readableTime, sanitizeTime } from '../helpers'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment'
import PicDialog from './PicDialog'

interface Props {
  task: Task
  workEntry: WorkEntry
  deleteEntry: (id: string) => void
  changeTime: (entry: WorkEntry, newTime: number, date: moment.Moment) => void
}

export default function HistoryCard({ task, workEntry, deleteEntry, changeTime }: Props) {
  const [dialog, setDialog] = useState<boolean>(false)
  const [timeDialog, setTimeDialog] = useState<boolean>(false)
  const [picDia, setPicDia] = useState<boolean>(false)
  const [duration, setDuration] = useState(workEntry.minutes)
  const [date, setDate] = useState<moment.Moment>(parseUploadTime(workEntry.date))

  function handleDelete() {
    deleteEntry(workEntry.id ?? '')
    setDialog(false)
  }

  function handleTimeChange() {
    changeTime(workEntry, duration, date)
    setTimeDialog(false)
  }

  function dateChange(time: moment.Moment | null) {
    if (time !== null) {
      setDate(time)
    }
  }

  function setChipTime(hours: number) {
    setDuration(hours * 60)
  }

  function delDia() {
    return (
            <Dialog open={dialog} onClose={() => { setDialog(false) }}>
                <DialogTitle>
                    {task.title} Löschen?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Diesen Eintrag wirklich löschen? Dies kann nicht rückgängig gemacht werden!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' size='small' onClick={() => { setDialog(false) }}>Abbrechen</Button>
                    <Button variant='outlined' size='small' onClick={handleDelete}>Löschen</Button>
                </DialogActions>
            </Dialog>
    )
  }

  function changeDia() {
    return (
            <Dialog open={timeDialog} onClose={() => { setTimeDialog(false) }}>
                <DialogTitle>
                     Zeit für Aufgabe {task.title} ändern
                </DialogTitle>
                <DialogContent>
                  <Stack spacing={2}>
                    <Stack direction={'row'} spacing={1} sx={{justifyContent: 'center'}}>
                      <Chip label="2h" onClick={() => setChipTime(2)}/>
                      <Chip label="3h" onClick={() => setChipTime(3)}/>
                      <Chip label="4h" onClick={() => setChipTime(4)}/>
                      <Chip label="5h" onClick={() => setChipTime(5)}/>
                    </Stack> 
                    <NumericFormat
                        customInput={TextField}
                        onValueChange={(values) => { setDuration(Number(values.value)) }}
                        value={duration}
                        // you can define additional custom props that are all forwarded to the customInput e. g.
                        label='Neue Zeit:'
                        variant="outlined"
                        sx={{ mt: 1 }}
                    />
                    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'de'}>
                      <DatePicker label="Datum" defaultValue={date} onChange={(e) => dateChange(e)} value={date} disableFuture/>
                    </LocalizationProvider>
                  </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' size='small' onClick={() => { setTimeDialog(false) }}>Abbrechen</Button>
                    <Button variant='outlined' size='small' onClick={handleTimeChange}>Speichern</Button>
                </DialogActions>
            </Dialog>
    )
  }

  return (
      <Grid xs={12} md={4}>
        <Card>
          {
            task.image !== '' ?
              <>
              <CardMedia sx={{height: 140}} image={task.image} component='img' onClick={() => setPicDia(true)}/>
              <PicDialog visible={picDia} image={task.image} title={task.title} changeVisibility={setPicDia} />
              </>  
            : <></>
          }          
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
            <Button size="small" onClick={() => { setDialog(true) }}>Löschen</Button>
            <Button size="small" onClick={() => { setTimeDialog(true) }}>Bearbeiten</Button>
          </CardActions>
             {delDia()}
             {changeDia()}             
        </Card>
      </Grid>
  )
}
