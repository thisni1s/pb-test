import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar } from '@mui/material';


interface Props {
    username: string,
}

export default function TopBar({ username }: Props ) {

  return(
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1, ml: 2 }}>
          Simple Time
        </Typography>
        <IconButton><Avatar>{Array.from(username)[0]}</Avatar></IconButton>
      </Toolbar>        
    </AppBar>
  );
}