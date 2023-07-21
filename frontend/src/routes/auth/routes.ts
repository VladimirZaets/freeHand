const routes = {
  base: '/auth',
  pathname: {
    signin: 'signin',
    signup: 'signup',
    confirmEmail: 'email/confirm/:hash',
    passwordForgot: 'password/forgot',
  }
}
export default routes;