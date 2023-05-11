import React, { useRef, useState } from 'react'
import { Dialog, AppBar, Toolbar, IconButton, Typography, Button, Stack, TextField, Switch, Chip, Avatar, Input } from '@mui/material'
import { taskFromRecord, type Task } from '../models/Task'
import CloseIcon from '@mui/icons-material/Close'
import { type WorkEntry } from '../models/WorkEntry'
import { NumericFormat } from 'react-number-format'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import 'moment/locale/de';
import moment from 'moment'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { checkNum, formatUploadTime } from '../helpers'
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

interface Props {
  userid: string
  visible: boolean
  setVisible: (state: boolean) => void
  createEntry: (data: Task) => Promise<Task>
  createWorkEntry: (data: WorkEntry) => Promise<boolean>
  uploadPicture: (taskid: string, picture: Blob) => void
}

export default function NewTask({ userid, visible, setVisible, createEntry, createWorkEntry, uploadPicture }: Props) {
  const [title, setTitle] = useState<string>('')
  const [description, setDiscription] = useState<string>('')
  const [spendMin, setSpendMin] = useState<number>(0)
  const [done, setDone] = useState<boolean>(false)
  const [claim, setClaim] = useState<boolean>(false)
  const [photo, setPhoto] = useState<Photo>();
  const [pic, setPic] = useState<boolean>(false)
  const [priv, setPriv] = useState<boolean>(false)
  const [date, setDate] = useState<moment.Moment>(moment())
  const [blob, setBlob] = useState<File>()
  const pickerRef = useRef<HTMLInputElement>(null)

  async function handleClose (save: boolean) {
    console.log('close!!!', save)
    if (save) {
      // sanity checks
      if (title.length === 0 || (done && spendMin <= 0)) {
        alert('Titel muss gesetzt sein. Wenn die Aufgabe schon erledigt ist muss eine Dauer angegeben werden die größer 0 ist!')
      } else {
        const data = taskFromRecord({
          creator: userid,
          claimed: (claim || done) ? [userid] : [],
          title,
          description,
          done,
          private: priv,          
        })
        const task = await createEntry(data)
        if (pic && photo !== undefined) {
          const file = await (await fetch(photo.dataUrl ?? '')).blob()
          uploadPicture(task.id ?? '', file)
        }
        if (pic && blob !== undefined) {
          uploadPicture(task.id ?? '', blob)
        }
        if (task.id !== '' && task !== undefined && done) {
          await createWorkEntry({ user: userid, task: task.id ?? '', minutes: spendMin, date: formatUploadTime(date) })
        }
        if (task.id === undefined) {
          alert('error creating task')
        }
        setVisible(false)
        resetState()
      }
    } else {
      setVisible(false)
      resetState()
      console.log('visible is false')
    }
  }

  function resetState() {
    setTitle('')
    setDiscription('')
    setSpendMin(0)
    setDone(false)
    setClaim(false)
    setPriv(false)
    setDate(moment())
    setPhoto(undefined)
    setPic(false)
  }

  function dateChange(time: moment.Moment | null) {
    if (time !== null) {
      setDate(time)
    }
  }

  function setChipTime(hours: number) {
    setSpendMin(hours * 60)
  }

  async function picTaker() {
    const picture = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      quality: 100,
    })
    setPhoto(picture)
    setPic(true)
  }

  function clickRef() {
    console.log('hello')
    pickerRef.current?.click();
  }

  async function readFile() {
    const inFile: HTMLInputElement | null = pickerRef.current
    if (inFile !== null && inFile.files !== null) {
      const blob = inFile.files[0] ?? null
      setBlob(blob)
    }
  }

  return (
      <Dialog fullScreen open={visible} onClose={async () => { await handleClose(false) }}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge='start'
              color='inherit'
              onClick={async () => { await handleClose(false) }}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              Neue Aufgabe erstellen
            </Typography>
            <Button autoFocus color='inherit' onClick={async () => { await handleClose(true) }}>
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
          <Stack direction='row' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography sx={{ flexGrow: 1 }}>Private Aufgabe</Typography>
            <Switch
              checked={priv}
              onChange={(e) => { setPriv(e.target.checked) }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Stack>
          <Stack direction='row' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography sx={{ flexGrow: 1 }}>Aufgabe ist bereits Erledigt</Typography>
            <Switch
              checked={done}
              onChange={(e) => { setDone(e.target.checked) }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Stack>
          {
            done
              ? 
              <>
                <Stack direction={'row'} spacing={1} sx={{justifyContent: 'center'}}>
                    <Chip label="2h" onClick={() => setChipTime(2)}/>
                    <Chip label="3h" onClick={() => setChipTime(3)}/>
                    <Chip label="4h" onClick={() => setChipTime(4)}/>
                    <Chip label="5h" onClick={() => setChipTime(5)}/>
                </Stack>
                <NumericFormat
                  customInput={TextField}
                  onValueChange={(values) => { setSpendMin(Number(values.value)) }}
                  value={spendMin}
                  isAllowed={(values) => {
                    const { floatValue } = values
                    return checkNum(floatValue ?? 1)
                  }}
                  // you can define additional custom props that are all forwarded to the customInput e. g.
                  variant="outlined"
                  label='Arbeitszeit (Minuten)'
                  sx={{ mb: 2 }}
                />
                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'de'}>
                  <DatePicker label="Datum" defaultValue={date} onChange={(e) => dateChange(e)} value={date} disableFuture/>
                </LocalizationProvider>
              </>
              : 
              <Stack direction='row' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography sx={{ flexGrow: 1 }}>Aufgabe für mich vormerken?</Typography>
                <Switch
                  checked={claim}
                  onChange={(e) => { setClaim(e.target.checked) }}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Stack>
          }
          <Stack direction='row' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography sx={{ flexGrow: 1 }}>Bild hinzufügen?</Typography>
            <Switch
              checked={pic}
              onChange={(e) => { setPic(e.target.checked) }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Stack>
          {
            pic ?
              <>
                <Button variant="text" onClick={picTaker}>Auswählen / Aufnehmen</Button>
                <Button variant="contained" color="primary" onClick={clickRef}>upload file</Button>
                <input ref={pickerRef} type="file" style={{ display: 'none' }} accept='image/*' onChange={readFile}/>
                {
                  photo !== undefined ?
                    <Avatar variant='square' src={photo?.dataUrl} sx={{ width: 250, height: 250 }}/>
                  : <></>
                }
              </>
            :
            <></>
          }
        </Stack>
      </Dialog>
  )
}
