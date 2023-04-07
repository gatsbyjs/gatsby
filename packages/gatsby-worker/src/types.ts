export const EXECUTE = 0b01
export const ERROR = 0b10
export const RESULT = 0b11
export const END = 0b00
export const CUSTOM_MESSAGE = 0b100
export const WORKER_READY = 0b1000

type Counter = number

type CustomMessage = [typeof CUSTOM_MESSAGE, Counter, unknown]

type FunctionName = string | number | symbol
type FunctionArgs = Array<any>

type ExecuteMessage = [typeof EXECUTE, Counter, FunctionName, FunctionArgs]
type EndMessage = [typeof END, Counter]
type WorkerReadyMessage = [typeof WORKER_READY, Counter]

export type ParentMessageUnion = ExecuteMessage | EndMessage | CustomMessage

type ErrorType = string
type ErrorMessage = string
type ErrorStack = string

type TaskError = [
  typeof ERROR,
  Counter,
  ErrorType,
  ErrorMessage,
  ErrorStack | undefined,
  Error
]

type ResultType = unknown

type TaskResult = [typeof RESULT, Counter, ResultType]

export type ChildMessageUnion =
  | TaskError
  | TaskResult
  | CustomMessage
  | WorkerReadyMessage
