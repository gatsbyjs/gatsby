import signalExit from "signal-exit"
import fs from "fs-extra"
import {
  ParentMessageUnion,
  ChildMessageUnion,
  EXECUTE,
  END,
  ERROR,
  RESULT,
  CUSTOM_MESSAGE,
  WORKER_READY,
} from "./types"
import { isPromise } from "./utils"

let counter = 0
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

if (
  process.send &&
  process.env.GATSBY_WORKER_MODULE_PATH &&
  process.env.GATSBY_WORKER_IN_FLIGHT_DUMP_LOCATION
) {
  const workerInFlightsDumpLocation =
    process.env.GATSBY_WORKER_IN_FLIGHT_DUMP_LOCATION
  isWorker = true
  const listeners: Array<(msg: any) => void> = []

  const inFlightMessages = new Set<ChildMessageUnion>()
  signalExit(() => {
    if (inFlightMessages.size > 0) {
      // this need to be sync
      fs.outputJsonSync(
        workerInFlightsDumpLocation,
        Array.from(inFlightMessages)
      )
    }
  })

  function ensuredSendToMain(msg: ChildMessageUnion): void {
    inFlightMessages.add(msg)
    process.send!(msg, undefined, undefined, error => {
      if (!error) {
        inFlightMessages.delete(msg)
      }
    })
  }

  function onError(error: Error): void {
    if (error == null) {
      error = new Error(`"null" or "undefined" thrown`)
    }

    const msg: ChildMessageUnion = [
      ERROR,
      ++counter,
      error.constructor && error.constructor.name,
      error.message,
      error.stack,
      error,
    ]

    ensuredSendToMain(msg)
  }

  function onResult(result: unknown): void {
    const msg: ChildMessageUnion = [RESULT, ++counter, result]
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
        const poolMsg: ChildMessageUnion = [CUSTOM_MESSAGE, ++counter, msg]
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
        result = child[msg[2]].call(child, ...msg[3])
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
        listener(msg[2])
      }
    }
  }

  process.on(`message`, messageHandler)

  ensuredSendToMain([WORKER_READY, ++counter])
}

export { isWorker, getMessenger }
