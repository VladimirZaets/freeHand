const paths = {
  account: {
    notifications: '/user/notifications',
    notification: '/user/notification',
    passwordCreate: '/user/password/create',
    passwordForgot: '/account/password/forgot',
    passwordReset: '/account/password/reset',
    user: '/user',
  },
  auth: {
    signup: '/auth/local/callback',
    signin: '/auth/local/login',
    signout: '/auth/logout',
    verifyEmail: '/auth/local/confirm',
    providers: '/auth/list',
    github: '/auth/github/login',
  }
}

export default paths