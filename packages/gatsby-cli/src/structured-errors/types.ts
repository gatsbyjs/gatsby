import { IErrorMapEntry, ErrorId, ErrorCategory } from "./error-map"

export interface IConstructError {
  details: {
    id?: ErrorId
    context?: Record<string, string>
    error?: Error
    pluginName?: string
    [key: string]: unknown
  }
}

export interface ILocationPosition {
  line: number
  column: number
}

export interface IStructuredStackFrame {
  fileName: string
  functionName?: string
  lineNumber?: number
  columnNumber?: number
}

export interface IStructuredError {
  code?: string
  text: string
  stack: Array<IStructuredStackFrame>
  filePath?: string
  location?: {
    start: ILocationPosition
    end?: ILocationPosition
  }
  category?: keyof typeof ErrorCategory
  error?: Error
  group?: string
  level: IErrorMapEntry["level"]
  type?: IErrorMapEntry["type"]
  docsUrl?: string
  pluginName?: string
}

export interface IOptionalGraphQLInfoContext {
  codeFrame?: string
  filePath?: string
  urlPath?: string
  plugin?: string
}

export enum Level {
  ERROR = `ERROR`,
  WARNING = `WARNING`,
  INFO = `INFO`,
  DEBUG = `DEBUG`,
}

export enum Type {
  GRAPHQL = `GRAPHQL`,
  CONFIG = `CONFIG`,
  WEBPACK = `WEBPACK`,
  PLUGIN = `PLUGIN`,
}
