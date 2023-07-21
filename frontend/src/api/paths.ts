const paths = {
  account: {
    notifications: '/user/notifications',
    notification: '/user/notification',
    password: '/account/password',
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