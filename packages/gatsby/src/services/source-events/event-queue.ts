import fastq from "fastq"
import type { queue } from "fastq"
import { IGatsbyPlugin } from "../../redux/types"

type EventType = string
type MaybePromise<T> = Promise<T> | T
type EventHandlerArg<T, U> = () => T

type EventHandlerFn<T, U> = (args: U) => Promise<T>

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
    >(function ({ handler }, cb): void {
      const result = handler()

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
