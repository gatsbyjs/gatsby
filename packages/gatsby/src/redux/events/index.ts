import fastq from "fastq"
import type { queue } from "fastq"
import { createNode, createNodeId, createContentDigest } from "./actions"
import { IGatsbyPlugin } from "../types"

type EventType = string
type MaybePromise<T> = Promise<T> | T
type EventHandlerArg<T, U> = (
  context: U,
  actions: {
    createNode: typeof createNode
    createContentDigest: typeof createContentDigest
    createNodeId: (id: string) => string
  }
) => T

type EventHandlerFn<T, U> = (args: U) => Promise<T>

interface ISourceEventArgs<T, U> {
  type: EventType
  meta?: Record<string, unknown>
  handler: EventHandlerArg<T, U>
}

type EventHandler<T, U> = EventHandlerFn<T, U> & {
  type: EventType
  plugin: {
    id: IGatsbyPlugin["id"]
    name: IGatsbyPlugin["name"]
  }
}

interface ITask<T, U> {
  type: EventHandler<T, U>["type"]
  handler: EventHandlerArg<T, U>
  args: U
  plugin: EventHandler<T, U>["plugin"]
}

export type SourceEventQueue<T, U> = queue<ITask<T, U>, T | Awaited<T>>

let eventSystemQueue: queue | null

export function getQueue<T, U>(): SourceEventQueue<T, U> {
  if (!eventSystemQueue) {
    eventSystemQueue = fastq<
      unknown,
      ITask<T, U>,
      ReturnType<EventHandlerArg<T, U>>
    >(function ({ handler, args, type, plugin }, cb): void {
      console.log(`run ${type}`)
      const result = handler(args, {
        createNode,
        createContentDigest,
        createNodeId: createNodeId.bind(null, plugin.name),
      })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if ((result as MaybePromise<T>)?.then) {
        ;(result as unknown as Promise<T>).then(res => cb(null, res))
      } else {
        cb(null, result)
      }
    }, 1)
  }

  return eventSystemQueue as queue<ITask<Awaited<T>, U>>
}

function pushTaskToQueue<T, U>(
  task: ITask<T, U>
): Promise<ReturnType<EventHandlerArg<T, U>>> {
  return new Promise((resolve, reject) => {
    getQueue<T, U>().push(task, (err, result) => {
      if (err) {
        return reject(err)
      }

      return resolve(result as ReturnType<EventHandlerArg<T, U>>)
    })
  })
}

function wrapHandlerWithEventTracking<T, U>({
  type,
  handler,
}: ISourceEventArgs<T, U>): EventHandler<T, U> {
  function wrappedFunction(args: U): Promise<T> {
    if (!(wrappedFunction as unknown as EventHandler<T, U>).plugin) {
      throw new Error(`Please make sure you registered the function`)
    }

    return pushTaskToQueue<T, U>({
      type,
      handler,
      args,
      plugin: (wrappedFunction as unknown as EventHandler<T, U>).plugin,
    })
  }

  Object.defineProperty(wrappedFunction, `type`, {
    value: type,
  })
  Object.defineProperty(wrappedFunction, `plugin`, {
    value: null,
    writable: true,
  })

  return wrappedFunction as unknown as EventHandler<T, U>
}

export function defineSourceEvent<T, U>(
  args: ISourceEventArgs<T, U>
): EventHandler<T, U> {
  // TODO track call tree for debugging & replay
  return wrapHandlerWithEventTracking<T, U>(args)
}

export function runEvent<T, U>(
  sourceEvents: Array<EventHandler<T, U>>,
  eventName: EventType,
  args: U
): void {
  for (const event of sourceEvents) {
    if (event.type === eventName) {
      event(args)
    }
  }
}
