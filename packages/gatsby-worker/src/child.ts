import {
  ParentMessageUnion,
  ChildMessageUnion,
  EXECUTE,
  END,
  ERROR,
  RESULT,
} from "./types"
import { isPromise } from "./utils"

/**
 * Used to check wether current context is executed in worker process
 */
let isWorker = false

if (process.send && process.env.GATSBY_WORKER_MODULE_PATH) {
  isWorker = true
  const ensuredSendToMain = process.send.bind(process) as (
    msg: ChildMessageUnion
  ) => void

  function onError(error: Error): void {
    if (error == null) {
      error = new Error(`"null" or "undefined" thrown`)
    }

    const msg: ChildMessageUnion = [
      ERROR,
      error.constructor && error.constructor.name,
      error.message,
      error.stack,
      error,
    ]

    ensuredSendToMain(msg)
  }

  function onResult(result: unknown): void {
    const msg: ChildMessageUnion = [RESULT, result]
    ensuredSendToMain(msg)
  }

  const child = require(process.env.GATSBY_WORKER_MODULE_PATH)

  function messageHandler(msg: ParentMessageUnion): void {
    if (msg[0] === EXECUTE) {
      let result
      try {
        result = child[msg[1]].call(child, ...msg[2])
      } catch (e) {
        onError(e)
        return
      }

      if (isPromise(result)) {
        result.then(onResult, onError)
      } else {
        onResult(result)
      }
    } else if (msg[0] === END) {
      process.off(`message`, messageHandler)
    }
  }

  process.on(`message`, messageHandler)
}

export { isWorker }
