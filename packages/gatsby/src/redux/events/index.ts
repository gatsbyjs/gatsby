import fastq from "fastq"
import { AsyncLocalStorage } from "async_hooks"
import {
  createNode,
  createNodeId,
  createContentDigest,
  ICreateNodeArgs,
} from "./actions"

import type { IGatsbyPlugin } from "../types"
import type { queue } from "fastq"

type EventType = string
type MaybePromise<T> = Promise<T> | T
type EventHandlerArg<T, U> = (
  context: U,
  actions: {
    createNode: (args: ICreateNodeArgs) => ReturnType<typeof createNode>
    createContentDigest: typeof createContentDigest
    createNodeId: (id: string) => string
    pluginOptions: ITask<T, U>["plugin"]["pluginOptions"]
  }
) => T

type EventHandlerFn<T, U> = (args: U) => Promise<T>

interface ISourceEventArgs<T, U> {
  type: EventType
  description: string
  meta?: Record<string, unknown>
  handler: EventHandlerArg<T, U>
}

type EventHandler<T, U> = EventHandlerFn<T, U> & {
  type: EventType
  plugin: {
    id: IGatsbyPlugin["id"]
    name: IGatsbyPlugin["name"]
    // TODO get type from gatsby types insteady of copy paste
    pluginOptions: {
      plugins: []
      [key: string]: unknown
    }
  }
}

interface ITask<T, U> {
  type: EventHandler<T, U>["type"]
  handler: EventHandlerArg<T, U>
  args: U
  plugin: EventHandler<T, U>["plugin"]
}

export type SourceEventQueue<T, U> = queue<ITask<T, U>, T | Awaited<T>>

let eventSystemQueue: queue | null = null
let asyncStorage: AsyncLocalStorage | null = null

export function getQueue<T, U>(): SourceEventQueue<T, U> {
  if (!eventSystemQueue) {
    eventSystemQueue = fastq<
      unknown,
      ITask<T, U>,
      ReturnType<EventHandlerArg<T, U>>
    >(function ({ handler, args, type, plugin }, cb): void {
      const result = handler(args, {
        createNode: (args: ICreateNodeArgs) => createNode({ ...args, plugin }),
        createContentDigest,
        createNodeId: createNodeId.bind(null, plugin.name),
        pluginOptions: plugin.pluginOptions,
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

      console.log({ task })

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

    if (!asyncStorage) {
      asyncStorage = new AsyncLocalStorage()
    }

    // TOOD still have to wire this in
    // const nextLocalStorage = {
    //   parentId: id,
    //   gatsbyApi,
    //   pluginOptions,
    //   eventDefinitions,
    //   onCreateEvent,
    //   rootEventQueue,
    // }

    // asyncLocalStorage.run(nextLocalStorage, () => {
    //   createEvent({
    //     definition,
    //     context,
    //   })
    // })

    // return asyncLocalStorage(() => {

    // })
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
  definition: ISourceEventArgs<T, U>
): EventHandler<T, U> {
  if (!definition.type) {
    throw new Error(`Your event is missing a type name.`)
  }

  if (!definition.description) {
    throw new Error(`Please add a description to your event`)
  }

  if (!definition.handler) {
    throw new Error(`Please add a handler to your event`)
  }

  // TODO track call tree for debugging & replay
  return wrapHandlerWithEventTracking<T, U>(definition)
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
