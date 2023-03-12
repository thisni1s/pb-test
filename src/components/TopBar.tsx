import React, { useState, MouseEvent, useContext } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Tooltip, Menu, MenuItem, useTheme } from '@mui/material';
import { ThemeContext } from '../App';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';


interface Props {
    username: string,
    logout: () => void,
}

export default function TopBar({ username, logout }: Props ) {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const setThemeName = useContext(ThemeContext);
  const theme = useTheme();

  function handleOpenUserMenu(event: MouseEvent<HTMLElement>) {
    setAnchorElUser(event.currentTarget);
  }

  function handleCloseUserMenu() {
    setAnchorElUser(null);
  }

  function handleLogout() {
    handleCloseUserMenu();
    logout();
  }

  function currThemeName() {
    const ret: string = theme.palette.mode;
    return ret;
  }

  function changeTheme() {
    currThemeName() === 'dark' ? setThemeName('light') : setThemeName('dark');
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
          <MenuItem key={'username'} disabled>
            <Typography>{username}</Typography>
          </MenuItem>
          <MenuItem key={'logout'} onClick={handleLogout}>
            <LogoutIcon sx={{pr: 1}}/> <Typography textAlign="center">Logout</Typography>
          </MenuItem>
          <MenuItem key={'theme'} onClick={changeTheme}>
            {
              currThemeName() === 'dark' ?
              <> <DarkModeIcon/>  <ArrowForwardIcon/> <LightModeIcon/></>
              :
              <> <LightModeIcon/> <ArrowForwardIcon/> <DarkModeIcon/></>
            }
          </MenuItem>
        </Menu>
      </Toolbar>        
    </AppBar>
  );
}