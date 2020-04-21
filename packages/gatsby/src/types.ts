export interface IMatch {
  id: string
  context: {
    sourceMessage: string
    [key: string]: string | boolean
  }
  error?: Error | undefined
  [key: string]: unknown
}
