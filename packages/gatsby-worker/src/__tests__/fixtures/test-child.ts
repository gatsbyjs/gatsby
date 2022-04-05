import { getMessenger } from "../../"

export function sync(a: string, opts?: { addWorkerId?: boolean }): string {
  return `foo ${a}${
    opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``
  }`
}

export async function async(
  a: string,
  opts?: { addWorkerId?: boolean }
): Promise<string> {
  return `foo ${a}${
    opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``
  }`
}

export function pid(): number {
  return process.pid
}

export function neverEnding(): Promise<string> {
  return new Promise<string>(() => {})
}

export const notAFunction = `string`

export function syncThrow(
  a: string,
  opts?: { addWorkerId?: boolean; throwOnWorker?: number }
): string {
  if (
    !opts?.throwOnWorker ||
    opts?.throwOnWorker?.toString() === process.env.GATSBY_WORKER_ID
  ) {
    throw new Error(
      `sync throw${
        opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``
      }`
    )
  }

  return `foo ${a}${
    opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``
  }`
}

export async function asyncThrow(
  a: string,
  opts?: { addWorkerId?: boolean; throwOnWorker?: number }
): Promise<string> {
  if (
    !opts?.throwOnWorker ||
    opts?.throwOnWorker?.toString() === process.env.GATSBY_WORKER_ID
  ) {
    throw new Error(
      `async throw${
        opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``
      }`
    )
  }

  return `foo ${a}${
    opts?.addWorkerId ? ` (worker #${process.env.GATSBY_WORKER_ID})` : ``
  }`
}

// used in task queue as previous functions would be too often too fast
export async function async100ms(
  taskId: number,
  opts?: { addWorkerId?: boolean }
): Promise<{ taskId: number; workerId: string }> {
  return new Promise(resolve =>
    setTimeout(resolve, 100, {
      taskId,
      workerId: opts?.addWorkerId ? process.env.GATSBY_WORKER_ID : undefined,
    })
  )
}

interface IPingMessage {
  type: `PING`
}

interface ILotOfMessagesTestMessage {
  type: `LOT_OF_MESSAGES_TEST`
  payload: number
}

export type MessagesFromChild = IPingMessage | ILotOfMessagesTestMessage

interface IPongMessage {
  type: `PONG`
}

export type MessagesFromParent = IPongMessage

let setupPingPongMessages = function (): Promise<void> {
  throw new Error(`gatsby-worker messenger not available`)
}
let getWasPonged = function (): boolean {
  throw new Error(`gatsby-worker messenger not available`)
}

let lotOfMessagesAndExit = function (count: number): void {
  throw new Error(`gatsby-worker messenger not available`)
}

const messenger = getMessenger<MessagesFromParent, MessagesFromChild>()
if (messenger) {
  let wasPonged = false
  setupPingPongMessages = function (): Promise<void> {
    if (messenger.messagingVersion === 1) {
      const pongPromise = new Promise<void>(resolve => {
        messenger.onMessage(msg => {
          if (msg.type === `PONG`) {
            wasPonged = true
            resolve()
          }
        })
      })

      messenger.sendMessage({ type: `PING` })

      return pongPromise
    }

    return Promise.reject(
      new Error(
        `Not supported messaging version: "${messenger.messagingVersion}"`
      )
    )
  }

  getWasPonged = function getWasPonged(): boolean {
    return wasPonged
  }

  lotOfMessagesAndExit = function lotOfMessagesAndExit(count: number): boolean {
    for (let i = 0; i < count; i++) {
      messenger.sendMessage({ type: `LOT_OF_MESSAGES_TEST`, payload: i })
    }
    process.exit(1)
  }
}

export { setupPingPongMessages, getWasPonged, lotOfMessagesAndExit }
