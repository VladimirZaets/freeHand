export interface IAlert {
  isOpen: boolean
  message: any
  type?: string
  duration?: number
  position?: {
    vertical: string
    horizontal: string
  }
}