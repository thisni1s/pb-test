import React, { useState, MouseEvent } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Tooltip, Menu, MenuItem } from '@mui/material';


interface Props {
    username: string,
    logout: () => void,
}

export default function TopBar({ username, logout }: Props ) {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

  function handleOpenUserMenu(event: MouseEvent<HTMLElement>) {
    setAnchorElUser(event.currentTarget);
  };

  function handleCloseUserMenu() {
    setAnchorElUser(null);
  };

  function handleLogout() {
    handleCloseUserMenu();
    logout();
  }

  return(
    <AppBar position='fixed' sx={{maxHeight: '10%'}}>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1, ml: 2 }}>
          Simple Time
        </Typography>
        <Tooltip title="Einstellungen">
          <IconButton onClick={handleOpenUserMenu}><Avatar>{Array.from(username)[0]}</Avatar></IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: '45px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{vertical: 'top', horizontal: 'right',}}
          keepMounted
          transformOrigin={{vertical: 'top', horizontal: 'right',}}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <MenuItem key={'logout'} onClick={handleLogout}>
            <Typography textAlign="center">Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>        
    </AppBar>
  );
}