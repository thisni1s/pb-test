import React, { useState } from 'react'
import { Card, CardContent, Typography, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, ButtonGroup, Tooltip } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2' // Grid version 2
import { NumericFormat } from 'react-number-format'
import { type Task } from '../models/Task'

import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { checkNum } from '../helpers'

interface Props {
  userid: string
  task: Task
  doneClaimNames: string[]
  fByMe?: boolean
  creatorName: string
  deleteEntry: (id: string) => void
  changeVisibility: (id: string) => void
  claim: (id: string) => void
  finish: (id: string, duration: number) => void
}
interface ClaimProps {
  single: boolean
}

export default function TaskCard({ userid, task, doneClaimNames, fByMe, creatorName, deleteEntry, changeVisibility, claim, finish }: Props) {
  const [dialog, setDialog] = useState<boolean>(false)
  const [delDia, setDelDia] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)

  function handleDelete() {
    deleteEntry(task.id ?? '')
    setDelDia(false)
  }

  function handleVisibilityChange() {
    changeVisibility(task.id ?? '')
  }

  function handleFinish() {
    finish(task.id ?? '', duration)
    setDialog(false)
  }

  function handleClaim() {
    claim(task.id ?? '')
  }

  function ClaimButton({ single }: ClaimProps) {
    const sx = single ? { flexGrow: 1 } : {}
    return (
        <Button variant='outlined' size='small' sx={sx} onClick={handleClaim}>{!task.claimed.includes(userid) ? <AddIcon fontSize='small'/> : <RemoveIcon fontSize='small'/>}</Button>
    )
  }

  function AddClaim() {
    const claimedStrEnd = task.claimed.length > 1 ? ' u.a.' : ''
    const claimedStr = doneClaimNames[0] + claimedStrEnd
    return (
        <ButtonGroup variant='outlined' aria-label='claim-button-group' size='small' sx={{ flexGrow: 1 }}>
          <Button disabled sx={{ overflow: 'hidden', flexGrow: 1 }}>{claimedStr}</Button>
          <ClaimButton single={false}/>
        </ButtonGroup>
    )
  }

  function UserIsCreator() {
    return (
      <Stack direction='row' spacing={1} sx={{ display: 'flex', mt: 1}}>
        <IconButton aria-label='delete' size='small' sx={{flexGrow: 1}} onClick={() => { setDelDia(true) }}><DeleteIcon fontSize='small'/></IconButton>
        <IconButton aria-label='delete' size='small' sx={{flexGrow: 1}} onClick={() => { handleVisibilityChange() }}> {task.private ? <Tooltip title="Privat"><VisibilityOffIcon fontSize='small'/></Tooltip> : <Tooltip title="Öffentlich"><VisibilityIcon fontSize='small'/></Tooltip>} </IconButton>
      </Stack>
    )
  }

  function unfinishedTask() {
    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ display: 'flex', mt: 1, flexWrap: 'nowrap' }}>
          {
            task.claimed.length > 0
              ? <AddClaim/>
              : <ClaimButton single={true}/>
          }
          <Button variant='outlined' size='small' sx={{ flexGrow: 1 }} onClick={() => { setDialog(true) }}><CheckIcon fontSize='small'/></Button>
          {
            task.creator === userid ? UserIsCreator() : <></>
          }
        </Stack>
    )
  }

  function finishedTask() {
    return (
        <>
        <Typography color='text.secondary' variant='caption' gutterBottom>Erledigt von: {doneClaimNames?.join(', ')}</Typography>
        <Stack direction='row' spacing={2} sx={{ display: 'flex', mt: 1 }}>
          <Button disabled={fByMe} variant='outlined' size='small' sx={{ flexGrow: 1 }} onClick={() => { setDialog(true) }}>Zeit nachtragen</Button>
        </Stack>
        </>
    )
  }

  function publicPrivateText() {
    if(task.creator !== userid) {
      return <></>
    } else {
      const text = task.private ? 'Privat' : 'Öffentlich'
      return (
        <Typography color='text.secondary' variant='caption'>
          {text}
        </Typography>
      )
    }
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
            <Stack direction={'row'} spacing={1} sx={{ display: 'flex', justifyContent: 'space-between'}}>
              <Typography color='text.secondary' variant='caption'>
                  Erstellt von: {task.creator === userid ? 'Dir' : creatorName}
              </Typography>
              {publicPrivateText()}            
            </Stack>
            {!task.done ? unfinishedTask() : finishedTask()}
            <Dialog open={dialog} onClose={() => { setDialog(false) }}>
              <DialogTitle>
                {task.title}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                    Aufgabe als Erledigt markieren?
                </DialogContentText>
                <NumericFormat
                  customInput={TextField}
                  onValueChange={(values) => { setDuration(Number(values.value)) }}
                  value={duration}
                  isAllowed={(values) => {
                    const { floatValue } = values
                    return checkNum(floatValue ?? 1)
                  }}
                  // you can define additional custom props that are all forwarded to the customInput e. g.
                  variant="outlined"
                  label='Arbeitszeit (Minuten)'
                  sx={{ mb: 1, mt: 2 }}
                />
                <DialogActions>
                  <Button variant='outlined' size='small' sx={{ flexGrow: 1 }} onClick={() => { setDialog(false) }}>Abbrechen</Button>
                  <Button variant='outlined' size='small' sx={{ flexGrow: 1 }} onClick={handleFinish}>Speichern</Button>
                </DialogActions>
              </DialogContent>
            </Dialog>
            <Dialog open={delDia} onClose={() => { setDelDia(false) }}>
              <DialogTitle>Delete {task.title} ?</DialogTitle>
              <DialogActions>
                <Button variant='outlined' size='small' sx={{ flexGrow: 1 }} onClick={() => { handleDelete() }}>Löschen</Button>
                <Button variant='outlined' size='small' sx={{ flexGrow: 1 }} onClick={() => { setDelDia(false) }}>Abbrechen</Button>
              </DialogActions>
            </Dialog>
          </CardContent>
        </Card>
      </Grid>
  )
}
