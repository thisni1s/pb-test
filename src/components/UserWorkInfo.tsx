import React, { useState } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Typography, Button, Stack, TextField, Switch } from '@mui/material';
import { Task } from '../models/Task';
import CloseIcon from '@mui/icons-material/Close';
import { WorkEntry } from '../models/WorkEntry';


interface Props {
    userid: string,
    visible: boolean
    setVisible: (state: boolean) => void,
}

export default function UserWorkInfo({ userid, visible, setVisible }: Props ) {

    function handleClose() {
      setVisible(false)        
    }

    return (
      <Dialog open={visible} onClose={handleClose}>
        <Typography>Hello World {userid}</Typography>
      </Dialog>
    );

  };