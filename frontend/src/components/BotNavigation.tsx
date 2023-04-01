import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import HistoryIcon from '@mui/icons-material/History'
import InventoryIcon from '@mui/icons-material/Inventory'
import TableChartIcon from '@mui/icons-material/TableChart'

interface Props {
  value: number
  moderator: boolean
}

export default function BotNavigation({ value, moderator }: Props) {
  const navigate = useNavigate()

  function nav(event: any, newValue: number) {
    if (newValue !== value) {
      switch (newValue) {
        case 0:
          navigate('/home')
          break
        case 1:
          navigate('/history')
          break
        case 2:
          navigate('/statistics')
          break
        default:
          break
      }
    }
  }

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxHeight: '10%' }} elevation={3}>
      <BottomNavigation value={value} onChange={nav}>
        <BottomNavigationAction label='Home' icon={<InventoryIcon />} />
        <BottomNavigationAction label='History' icon={<HistoryIcon />} />
        {moderator ? <BottomNavigationAction label='Statistics' icon={<TableChartIcon />} /> : <></>}
      </BottomNavigation>
    </Paper>
  )
}
