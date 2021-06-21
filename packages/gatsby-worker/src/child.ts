import { parentPort, workerData, MessagePort } from "worker_threads"
import {
  ParentMessageUnion,
  ChildMessageUnion,
  EXECUTE,
  ERROR,
  RESULT,
  CUSTOM_MESSAGE,
} from "./types"

let ensuredParentPort: MessagePort

if (!parentPort) {
  throw new Error(`I was told there would be parentPort :shrug:`)
} else {
  ensuredParentPort = parentPort
}

const listeners: Array<(msg: unknown) => void> = []
process.gatsbyWorker = {
  onMessage(listener: (msg: unknown) => void): void {
    listeners.push(listener)
  },
  sendMessage(msg: unknown): void {
    const poolMsg = [CUSTOM_MESSAGE, msg]
    ensuredParentPort.postMessage(poolMsg)
  },
}

const child = require(workerData.moduleToExecute)

const isPromise = (obj: any): obj is PromiseLike<unknown> =>
  !!obj &&
  (typeof obj === `object` || typeof obj === `function`) &&
  typeof obj.then === `function`

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

  ensuredParentPort.postMessage(msg)
}

function onResult(result: unknown): void {
  const msg = [RESULT, result]
  ensuredParentPort.postMessage(msg)
}

parentPort.on(`message`, (msg: ParentMessageUnion) => {
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
  } else if (msg[0] === CUSTOM_MESSAGE) {
    for (const listener of listeners) {
      listener(msg[1])
    }
  }
})
