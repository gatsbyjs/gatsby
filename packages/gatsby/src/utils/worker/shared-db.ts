import { open, RootDatabase, Database } from "lmdb-store"
import { IGatsbyState, ActionsUnion } from "../../redux/types"
import { store } from "../../redux"
import { omit } from "lodash"
import report from "gatsby-cli/lib/reporter"
import pDefer from "p-defer"
import uuidv4 from "uuid/v4"
// import { createPageDependency } from "../../redux/actions/add-page-dependency"
// let rootDb: RootDatabase | undefined

type MessageKey = ["from" | "to", number, number]

interface ISharedDatabases {
  snapshots: Database<any, string>
  dataDependencies: Database<{ nodeId: string; connection?: string }, string>
  messaging: Database<IMessage, MessageKey>
}

interface IMessagePendingPromise<PayloadType = any> {
  type: `promise.pending`
  namespace: string
  payload: PayloadType
  uuid: string
}

interface IMessageResolvedPromise<ResultType = any> {
  type: `promise.resolved`
  namespace: string
  result: ResultType
  uuid: string
}

interface IRemotePromiseConfig<ResultType, PayloadType> {
  create: (payload: PayloadType) => Promise<ResultType>
  handle: (
    message: IMessagePendingPromise,
    messageChannel: number
  ) => Promise<ResultType>
}

type IMessage =
  | {
      type: `redux`
      action: ActionsUnion
    }
  | IMessagePendingPromise
  | IMessageResolvedPromise

let dbs

function getDBs(): ISharedDatabases {
  if (!dbs) {
    const rootDb = open({
      name: `shared`,
      path: process.cwd() + `/.cache/data/shared`,
      compression: true, // do we want that here?
    })

    if (!process.env.JEST_WORKER_ID) {
      rootDb.clear()
    }

    dbs = {
      snapshots: rootDb.openDB({
        name: `snapshots`,
        // structuredClone needed for Set/Map
        // @ts-ignore structuredClone doesn't exist in types, but is passed to msgpackr
        structuredClone: true,
      }),
      dataDependencies: rootDb.openDB({
        name: `dataDependencies`,
      }),
      messaging: rootDb.openDB({
        name: `messaging`,
      }),
    }
  }
  return dbs
}

export function clear(): void {
  report.verbose(`clearing db`)
  const db = getDBs().snapshots
  db.transactionSync(() => {
    db.clear()
  })
}

export async function setProgram(
  program: IGatsbyState["program"]
): Promise<any> {
  return getDBs().snapshots.put(
    `program`,
    omit(program, [`report`, `setStore`])
  )
}

export function hydrateProgram(): void {
  const program = getDBs().snapshots.get(`program`)

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: { ...program, setStore: (): void => {}, report },
  })
}

export async function setInferenceMetadata(
  inferenceMetadata: IGatsbyState["inferenceMetadata"]
): Promise<any> {
  return getDBs().snapshots.put(`inferenceMetadata`, inferenceMetadata)
}

export function hydrateInferenceMetadata(): void {
  const inferenceMetadata = getDBs().snapshots.get(`inferenceMetadata`)

  store.dispatch({
    type: `SET_INFERENCE_METADATA`,
    payload: inferenceMetadata,
  })
}

export async function setExtractedQueries(
  components: IGatsbyState["components"],
  staticQueryComponents: IGatsbyState["staticQueryComponents"]
): Promise<any> {
  return Promise.all([
    getDBs().snapshots.put(`components`, components),
    getDBs().snapshots.put(`staticQueryComponents`, staticQueryComponents),
  ])
}

export function hydrateExtractedQueries(): void {
  const components = getDBs().snapshots.get(`components`)
  const staticQueryComponents = getDBs().snapshots.get(`staticQueryComponents`)

  store.dispatch({
    type: `SET_EXTRACTED_QUERIES`,
    payload: {
      components,
      staticQueryComponents,
    },
  })
}

let updatePromise: Promise<boolean> | undefined

export function ready(): Promise<boolean> | undefined {
  return updatePromise
}

// each worker remembers their own message counter
let sendMessageCounter: number
let readMessageCounter: number
const messageChannel = parseInt(process.env.JEST_WORKER_ID ?? ``, 10) ?? 0
const promisesToResolve = new Map<string, pDefer.DeferredPromise<any>>()

let readMessages: Map<number, number>
let sendMessages: Map<number, number>
export function initMessaging(isMain: boolean, numWorkers?: number): void {
  if (isMain) {
    if (!numWorkers) {
      throw new Error(`need numWorkers in main`)
    }
    readMessages = new Map()
    sendMessages = new Map()
    for (let i = 1; i <= numWorkers; i++) {
      readMessages.set(i, 0)
      sendMessages.set(i, 0)
    }
    setInterval(dispatchActionFromWorkers, 100)
  } else {
    sendMessageCounter = 0
    readMessageCounter = 0
    setInterval(readFromMain, 100)
  }
}

function readFromMain(): void {
  let lastMessageFromMain

  const rangeOptions = {
    start: [`to`, messageChannel, readMessageCounter],
    end: [`to`, messageChannel + 1, 0],
  }

  const messagingDB = getDBs().messaging
  const iterator = messagingDB.getRange(rangeOptions)

  for (const {
    key: [workerID, messageIndex],
    value: message,
  } of iterator) {
    // console.log({ messageChannel, message })
    // if (message.type === `redux`) {
    //   store.dispatch(message.action)
    // }
    if (message.type === `promise.resolved`) {
      const deferred = promisesToResolve.get(message.uuid)
      deferred?.resolve(message.result)
    }
    lastMessageFromMain = messageIndex
  }

  if (lastMessageFromMain) {
    readMessageCounter = lastMessageFromMain + 1
  }
}

export function forwardToMain(action: ActionsUnion): void {
  const key: MessageKey = [`from`, messageChannel, ++sendMessageCounter]

  updatePromise = getDBs().messaging.put(key, { type: `redux`, action })
}

const remotePromiseHandlers = new Map<string, IRemotePromiseConfig<any, any>>()

export function remotePromiseHandler<ResultType, PayloadType>(
  namespace: string,
  executor: (payload: PayloadType) => Promise<ResultType>
): IRemotePromiseConfig<ResultType, PayloadType> {
  const ret: IRemotePromiseConfig<ResultType, PayloadType> = {
    // executed in worker
    create(payload: PayloadType): Promise<ResultType> {
      const deferred = pDefer<ResultType>()

      const key: MessageKey = [`from`, messageChannel, ++sendMessageCounter]
      const uuid = uuidv4()
      promisesToResolve.set(uuid, deferred)
      const stuff: IMessagePendingPromise = {
        type: `promise.pending`,
        namespace,
        payload,
        uuid,
      }
      updatePromise = getDBs().messaging.put(key, stuff)

      return deferred.promise
    },
    // executed in main
    async handle(
      message: IMessagePendingPromise<PayloadType>,
      messageChannel: number
    ): Promise<ResultType> {
      const result = await executor({ ...message.payload, store })

      const messageCounter = (sendMessages.get(messageChannel) || 0) + 1
      sendMessages.set(messageChannel, messageCounter)

      const key: MessageKey = [`to`, messageChannel, messageCounter]
      updatePromise = getDBs().messaging.put(key, {
        type: `promise.resolved`,
        namespace,
        result,
        uuid: message.uuid,
      })

      return result
    },
  }

  remotePromiseHandlers.set(namespace, ret)

  return ret
}

export function dispatchActionFromWorkers(): void {
  const messagingDB = getDBs().messaging

  for (const [workerID, indexOfNextMessagesToRead] of readMessages.entries()) {
    let lastMessageFromWorker

    const rangeOptions: { start: MessageKey; end: MessageKey } = {
      start: [`from`, workerID, indexOfNextMessagesToRead],
      end: [`from`, workerID + 1, 0],
    }

    const iterator = messagingDB.getRange(rangeOptions)

    for (const {
      key: [_, workerID, messageIndex],
      value: message,
    } of iterator) {
      if (message.type === `redux`) {
        store.dispatch(message.action)
      } else if (message.type === `promise.pending`) {
        const handler = remotePromiseHandlers.get(message.namespace)
        if (!handler) {
          console.log(`no handler registered for ${message.namespace}`)
          continue
        }

        handler.handle(message, workerID)
      }
      lastMessageFromWorker = messageIndex
    }

    if (lastMessageFromWorker) {
      readMessages.set(workerID, lastMessageFromWorker + 1)
    }
  }
}
