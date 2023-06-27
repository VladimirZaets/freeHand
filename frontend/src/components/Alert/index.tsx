import Snackbar from '@mui/material/Snackbar';
import Alert , { AlertColor } from '@mui/material/Alert';
//@ts-ignore
import {IAlert} from "./index";
import * as React from "react";

const UserAlert = ({data, onClose}:{data:IAlert, onClose: (e:React.SyntheticEvent<any> | Event) => void}) => {
  if (!data.isOpen) return null;
  return (
    <Snackbar 
      open={data.isOpen}
      autoHideDuration={6000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={data.type as AlertColor} sx={{ width: '100%' }}>
        {data.message}
      </Alert>
    </Snackbar>
  )
}

export default UserAlert;