import { useAppDispatch, useAppSelector } from "../../store"
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { closeNotification } from '../../redux/common/reducer';

const Notification = () => {
  const notification = useAppSelector((state) => state.common.notification);
  const dispatch = useAppDispatch();
  const handleClose = () => {dispatch(closeNotification())}
  
  return (
    <Snackbar 
      open={notification.isOpen} 
      autoHideDuration={6000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        This is a success message!
      </Alert>
    </Snackbar>
  )
}

export default Notification;