import { globalTracer, Span } from "opentracing"
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
import { initTracer } from "./tracer"

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
  const startedSpans = new Set<Span>()

  type Deserializer = (
    value: any,
    root: string,
    tags?: Record<string, string>
  ) => any

  function SpanPlaceholderForTags(value: any): any {
    const span = globalTracer().extract(`text_map`, value)

    if (span) {
      return `Span`
    }
  }

  function ExtractSpanAndGenerateWrapper(
    value: any,
    root: string,
    tags?: Record<string, string>
  ): any {
    const span = globalTracer().extract(`text_map`, value)

    if (span) {
      const workerExecuteSpan = globalTracer().startSpan(`worker execute`, {
        childOf: span,
        tags: {
          workerId: process.env.GATSBY_WORKER_ID,
          ...(tags ?? {}),
          args: deserializeArgsFromIPC(root, { Span: SpanPlaceholderForTags }),
        },
      })
      startedSpans.add(workerExecuteSpan)
      return workerExecuteSpan
    }
  }

  function deserializeArgsFromIPC(
    args: string,
    { Span, tags }: { Span: Deserializer; tags?: Record<string, string> }
  ): Array<any> {
    return JSON.parse(args, function (_key, value) {
      if (typeof value === `object` && value && value.___srlztn === `Span`) {
        return Span(value, args, tags)
      }

      return value
    })
  }

  const ensuredSendToMain = process.send.bind(process) as (
    msg: ChildMessageUnion
  ) => void

  function onError(error: Error): void {
    if (error == null) {
      error = new Error(`"null" or "undefined" thrown`)
    }

    for (const startedSpan of startedSpans) {
      startedSpan.finish()
    }
    startedSpans.clear()

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
    for (const startedSpan of startedSpans) {
      startedSpan.finish()
    }
    startedSpans.clear()

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
        const args = deserializeArgsFromIPC(msg[2], {
          Span: ExtractSpanAndGenerateWrapper,
          tags: {
            workerFunction: msg[1],
          },
        })
        result = child[msg[1]].call(child, ...args)
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

  initTracer(process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ?? ``).then(() => {
    ensuredSendToMain([WORKER_READY])
  })
}

export { isWorker, getMessenger }
