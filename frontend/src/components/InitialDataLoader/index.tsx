import { useAppDispatch } from "../../store"
import { getUserByToken, getSocialSigninOptions } from "../../redux/account/actions"

const InitialDataLoader = () => {
  const dispatch = useAppDispatch()
  dispatch(getUserByToken())

  return null
}

export default InitialDataLoader;