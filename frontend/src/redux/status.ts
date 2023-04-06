interface IAsyncStatuses {
  initial: string,
  pending: string,
  fulfilled: string
  error: string
}

export const asyncStatuses:IAsyncStatuses = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  error: 'error',
  initial: 'initial'
}