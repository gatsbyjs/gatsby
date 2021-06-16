export const EXECUTE = 0b01
export const ERROR = 0b10
export const RESULT = 0b11
export const CUSTOM_MESSAGE = 0b00

type CustomMessage = [typeof CUSTOM_MESSAGE, unknown]

type FunctionName = string | number | symbol
type FunctionArgs = any

type ExecuteMessage = [typeof EXECUTE, FunctionName, FunctionArgs]

export type ParentMessageUnion = ExecuteMessage | CustomMessage

type ErrorType = string
type ErrorMessage = string
type ErrorStack = string

type TaskError = [
  typeof ERROR,
  ErrorType,
  ErrorMessage,
  ErrorStack | undefined,
  Error
]

type ResultType = unknown

type TaskResult = [typeof RESULT, ResultType]

export type ChildMessageUnion = TaskError | TaskResult | CustomMessage
