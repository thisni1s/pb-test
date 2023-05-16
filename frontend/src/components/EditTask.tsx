import React, { useRef, useState, useEffect } from 'react'
import { Dialog, AppBar, Toolbar, IconButton, Typography, Button, Stack, TextField, Switch } from '@mui/material'
import { type Task } from '../models/Task'
import CloseIcon from '@mui/icons-material/Close'
import ClearIcon from '@mui/icons-material/Clear';
import 'moment/locale/de';

interface Props {
  visible: boolean
  task: Task
  setVisible: (state: boolean) => void
  editTask: (taskid: string, body?: Object, formData?: FormData) => void
  deleteTask: (taskid: string) => void
}

enum Operations {
    CHANGE = "CHANGE",
    DELETE = "DELETE",
    CLOSE = "CLOSE"
}

export default function EditTask({ visible, task, setVisible, editTask, deleteTask }: Props) {
  const [title, setTitle] = useState<string>(task.title)
  const [description, setDiscription] = useState<string>(task.description)
  const [priv, setPriv] = useState<boolean>(task.private)
  const [blob, setBlob] = useState<File | undefined>(undefined)
  const [pic, setPic] = useState<string | undefined>(task.image)
  const pickerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitle(task.title)
    setDiscription(task.description)
    setPriv(task.private)
    setPic(task.image)
  }, [task])

  async function handleClose (operation: Operations) {
    switch (operation) {
        case Operations.CLOSE:
            resetState(false) 
            break;
        case Operations.CHANGE:
            changeTask()
            break;
        case Operations.DELETE:
            delTask()
            resetState(false)
            break;
        default:
            break;
    }
    setVisible(false)
    
  }

  function changeTask() {
    const formData = new FormData()
    let body = {}
    let bodySet = false
    let formSet = false
    if(title !== task.title && title !== '') {
        body = {
            title: title,
            ...body
        }
        bodySet = true
    }
    if(description !== task.description && description !== '') {
        body = {
            description: description,
            ...body
        }
        bodySet = true
    }
    if(priv !== task.private) {
        body = {
            private: priv,
            ...body
        }
        bodySet = true
    }
    if(blob !== undefined) {
        formData.append('image', blob)
        formSet = true
    } else if (pic === undefined && task.image !== undefined){
        body = {
            image: null,
            ...body
        }
        bodySet = true
    }
    resetState(true)
    editTask(task.id ?? '', bodySet ? body : undefined, formSet ? formData : undefined)
  }

  function delTask() {
    deleteTask(task.id ?? '')
  }

  function resetState(saved: boolean) {
    if(!saved) {
      setTitle(task.title)
      setDiscription(task.description)
      setPriv(task.private)
      setPic(task.image)
    }
    setBlob(undefined)
  }

  function clickRef() {
    pickerRef.current?.click();
  }

  async function readFile() {
    const inFile: HTMLInputElement | null = pickerRef.current
    if (inFile !== null && inFile.files !== null) {
      const blob = inFile.files[0] ?? null
      setBlob(blob)
      setPic(URL.createObjectURL(blob))
    }
  }

  function clearBlob() {
    setPic(undefined)
    setBlob(undefined)
  }

  return (
      <Dialog fullScreen open={visible} onClose={async () => { await handleClose(Operations.CLOSE) }}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge='start'
              color='inherit'
              onClick={async () => { await handleClose(Operations.CLOSE) }}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              Bearbeiten: {task.title} 
            </Typography>
            <Button autoFocus color='inherit' onClick={async () => { await handleClose(Operations.DELETE) }}>
              Löschen
            </Button>
            <Button autoFocus color='inherit' onClick={async () => { await handleClose(Operations.CHANGE) }}>
              Speichern
            </Button>
          </Toolbar>
        </AppBar>
        <Stack spacing={2} sx={{ mt: 2, ml: 2, mr: 2, display: 'flex' }}>
          <TextField
            placeholder='Titel'
            label='Titel'
            value={title}
            onChange={(e) => { setTitle(e.target.value) }}
          />
          <TextField
            placeholder='Description'
            label='Description'
            multiline
            rows={4}
            value={description}
            onChange={(e) => { setDiscription(e.target.value) }}
          />
          <Stack direction='row' sx={stackSx}>
            <Typography sx={{ flexGrow: 1 }}>Private Aufgabe</Typography>
            <Switch
              checked={priv}
              onChange={(e) => { setPriv(e.target.checked) }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Stack>         
          <Stack direction='row' sx={stackSx}>
            <Typography sx={{ flexGrow: 1 }}>Bild hinzufügen?</Typography>
            <Button variant="contained" color="primary" onClick={clickRef}> Auswählen
              <input ref={pickerRef} type="file" style={{ display: 'none' }} accept='image/*' onChange={readFile}/>
            </Button>
            {
              pic !== undefined ?
              <IconButton color='primary' aria-label="upload picture" component="label" onClick={clearBlob}><ClearIcon/></IconButton>
              : <></>
            }
          </Stack>
          {
            pic !== undefined ? <img src={pic} alt='hallo'/> : <></>
          }
        </Stack>
      </Dialog>
  )
}

const stackSx = { 
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}
