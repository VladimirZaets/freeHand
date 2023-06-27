interface INotification {
  id: string
  userId: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export {INotification}