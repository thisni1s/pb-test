import React, { useState } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Typography, Button, Stack, TextField, Switch, DialogTitle, TableContainer, Paper, TableBody, TableRow, TableCell, TableHead } from '@mui/material';
import { Task, WTask } from '../models/Task';
import CloseIcon from '@mui/icons-material/Close';
import { WorkEntry } from '../models/WorkEntry';
import { readableTime, sanitizeTime } from '../helpers';

interface Props {
    userid: string,
    username: string,
    visible: boolean,
    userEntries: WTask[],
    setVisible: (state: boolean) => void,
}

export default function UserWorkInfo({ userid, username, userEntries, visible, setVisible }: Props ) {

    function handleClose() {
      setVisible(false)        
    }

    function getEntries() {
      return userEntries.map(wtask => {
        console.log(wtask)
        return (
          <TableRow>
            <TableCell>{wtask[0].title}</TableCell>
            <TableCell>{sanitizeTime(wtask[1].minutes)}</TableCell>
            <TableCell>{readableTime(wtask[1].date)}</TableCell>
          </TableRow>
      )})
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
    );

  };