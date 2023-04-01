import React from 'react'
import { Dialog, DialogTitle, TableContainer, Paper, TableBody, TableRow, TableCell, TableHead } from '@mui/material'
import { type WTask } from '../models/Task'
import { readableTime, sanitizeTime } from '../helpers'

interface Props {
  userid: string
  username: string
  visible: boolean
  userEntries: WTask[]
  setVisible: (state: boolean) => void
}

export default function UserWorkInfo({ userid, username, userEntries, visible, setVisible }: Props) {
  function handleClose() {
    setVisible(false)
  }

  function getEntries() {
    return userEntries.map(wtask => {
      return (
          <TableRow key={wtask[1].id}>
            <TableCell>{wtask[0].title}</TableCell>
            <TableCell>{sanitizeTime(wtask[1].minutes)}</TableCell>
            <TableCell>{readableTime(wtask[1].date)}</TableCell>
          </TableRow>
      )
    })
  }

  return (
      <Dialog open={visible} onClose={handleClose}>
        <DialogTitle>{username}</DialogTitle>
        <TableContainer component={Paper}>
        <TableHead>
          <TableCell>Titel</TableCell>
          <TableCell>Zeit</TableCell>
          <TableCell>Datum</TableCell>
        </TableHead>
        <TableBody>
        {getEntries()}
        </TableBody>
        </TableContainer>
      </Dialog>
  )
}
