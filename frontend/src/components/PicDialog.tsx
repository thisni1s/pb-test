import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material"

interface Props {
    visible: boolean,
    image: string | undefined,
    title: string,
    changeVisibility: (val: boolean) => void,
}
  
export default function PicDialog({ visible, image, title, changeVisibility }: Props) {

    return (
        <Dialog open={visible} onClose={() => { changeVisibility(false) }}>
        <DialogTitle>Bild für {title} </DialogTitle>
        <img src={image} alt='hallo'/>
        <DialogActions>
          <Button variant='contained' size='small' sx={{ flexGrow: 1 }} onClick={() => { changeVisibility(false) }}>Schließen</Button>
        </DialogActions>
      </Dialog>
    )


}