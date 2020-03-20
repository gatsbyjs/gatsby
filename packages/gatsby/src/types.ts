export interface IMatch {
  id: string
  context: {
    sourceMessage: string
    [key: string]: string
  }
  error?: Error | undefined
  [key: string]: unknown
}
