import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../store";
import {getRedirectSelector} from "../../redux/common/selectors";
import {resetRedirect} from "../../redux/common/reducer";
import {useEffect} from "react";

const RedirectHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const redirect = useAppSelector(getRedirectSelector);
  useEffect(() => {
    if (redirect.redirect && redirect.path !== window.location.pathname) {
      dispatch(resetRedirect());
      navigate(redirect.path)
    } else if (redirect.redirect && redirect.path === window.location.pathname) {
      dispatch(resetRedirect());
    }
  }, [redirect])


  return (
    <>
      {children}
    </>
  )
}

export default RedirectHandler;