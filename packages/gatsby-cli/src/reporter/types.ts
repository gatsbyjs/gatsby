// TODO: This needs to be implemented when redux/acitons is converted to TS
export type CreateLogAction = any

export type ErrorMeta =
  | {
      id: string
      error?: Error
      context: Record<string, any>
      [id: string]: any
    }
  | string
  | Error
  | Array<ErrorMeta>
