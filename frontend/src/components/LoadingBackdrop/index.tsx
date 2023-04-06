import { useAppDispatch, useAppSelector } from "../../store"
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { closeLoadingBackdrop } from '../../redux/common/reducer';

const LoadingBackdrop = () => {
  const isOpen = useAppSelector((state) => state.common.isOpenLoadingBackdrop);
  const dispatch = useAppDispatch()

  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={isOpen}
      onClick={() => {dispatch(closeLoadingBackdrop())}}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}

export default LoadingBackdrop;