import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';

interface Props {
    value: number
}

export default function BotNavigation({ value }: Props ) {
  const navigate = useNavigate();

  function nav(event: any, newValue: number) {
    if(newValue != value) {
      switch(newValue) {
        case 0:
          navigate('/home');
          break;
        case 1:
          navigate('/history');
          break;
        case 2:
          alert('not implemented!');
        default:
          break;
        }
    }
  }

  return(
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation value={value} onChange={nav}>
        <BottomNavigationAction label='Home' icon={<InventoryIcon />} />
        <BottomNavigationAction label='History' icon={<HistoryIcon />} />      
      </BottomNavigation>
    </Paper>
  )
}