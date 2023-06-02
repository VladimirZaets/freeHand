import { useAppDispatch, useAppSelector } from "../../store"
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';

import { closeNotification } from '../../redux/common/reducer';

const Notification = () => {
  const notification = useAppSelector((state) => state.common.notification);
  const dispatch = useAppDispatch();
  const handleClose = () => {dispatch(closeNotification())}
  if (!notification.isOpen) return null;
  return (
    <Snackbar 
      open={notification.isOpen} 
      autoHideDuration={6000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={notification.type as AlertColor} sx={{ width: '100%' }}>
        {notification.message}
      </Alert>
    </Snackbar>
  )
}

export default Notification;