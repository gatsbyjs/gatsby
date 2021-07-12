import {
  ParentMessageUnion,
  ChildMessageUnion,
  EXECUTE,
  END,
  ERROR,
  RESULT,
  CUSTOM_MESSAGE,
} from "./types"
import { isPromise } from "./utils"

export interface IGatsbyWorkerMessenger<
  MessagesFromParent = unknown,
  MessagesFromChild = MessagesFromParent
> {
  onMessage: (listener: (msg: MessagesFromParent) => void) => void
  sendMessage: (msg: MessagesFromChild) => void
  messagingVersion: 1
}

/**
 * Used to check wether current context is executed in worker process
 */
let isWorker = false
let getMessenger = function <
  MessagesFromParent = unknown,
  MessagesFromChild = MessagesFromParent
>(): IGatsbyWorkerMessenger<MessagesFromParent, MessagesFromChild> | undefined {
  return undefined
}

if (process.send && process.env.GATSBY_WORKER_MODULE_PATH) {
  isWorker = true
  const listeners: Array<(msg: any) => void> = []
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

    try {
      ensuredSendToMain(msg)
    } catch (e) {
      // no-op
    }
  }

  function onResult(result: unknown): void {
    const msg: ChildMessageUnion = [RESULT, result]
    ensuredSendToMain(msg)
  }

  const MESSAGING_VERSION = 1

  getMessenger = function <
    MessagesFromParent = unknown,
    MessagesFromChild = MessagesFromParent
  >(): IGatsbyWorkerMessenger<MessagesFromParent, MessagesFromChild> {
    return {
      onMessage(listener: (msg: MessagesFromParent) => void): void {
        listeners.push(listener)
      },
      sendMessage(msg: MessagesFromChild): void {
        const poolMsg: ChildMessageUnion = [CUSTOM_MESSAGE, msg]
        ensuredSendToMain(poolMsg)
      },
      messagingVersion: MESSAGING_VERSION,
    }
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
    } else if (msg[0] === CUSTOM_MESSAGE) {
      for (const listener of listeners) {
        listener(msg[1])
      }
    }
  }

  process.on(`message`, messageHandler)
}

export { isWorker, getMessenger }
