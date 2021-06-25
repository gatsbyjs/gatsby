import {
  ParentMessageUnion,
  ChildMessageUnion,
  EXECUTE,
  END,
  ERROR,
  RESULT,
} from "./types"
import { isPromise } from "./utils"

let ensuredSendToMain: (msg: ChildMessageUnion) => void

if (!process.send) {
  throw new Error(`I was told there would be parentPort :shrug:`)
} else {
  ensuredSendToMain = process.send.bind(process)
}

if (!process.env.GATSBY_WORKER_MODULE_PATH) {
  throw new Error(`I was told there would be worker module path :shrug:`)
}

const child = require(process.env.GATSBY_WORKER_MODULE_PATH)

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
