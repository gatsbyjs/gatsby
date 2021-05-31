import { open, RootDatabase, Database } from "lmdb-store"
import { IGatsbyState, ActionsUnion } from "../../redux/types"
import { store } from "../../redux"
import { omit } from "lodash"
import report from "gatsby-cli/lib/reporter"
// import { createPageDependency } from "../../redux/actions/add-page-dependency"
// let rootDb: RootDatabase | undefined

interface ISharedDatabases {
  snapshots: Database<any, string>
  dataDependencies: Database<{ nodeId: string; connection?: string }, string>
  messaging: Database<ActionsUnion, [number, number]>
}

let dbs

function getDBs(): ISharedDatabases {
  if (!dbs) {
    const rootDb = open({
      name: `shared`,
      path: process.cwd() + `/.cache/data/shared`,
      compression: true, // do we want that here?
    })

    // rootDb.openDB()

    if (!process.env.JEST_WORKER_ID) {
      rootDb.clear()
    }

    rootDb.on(`beforecommit`, (...args) => {
      console.log(
        `[${process.env.JEST_WORKER_ID || `main`}] beforecommit`,
        args
      )
    })

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

let messageCounter = 0 // each worker remembers their own message counter
const messageChannel = parseInt(process.env.JEST_WORKER_ID ?? ``, 10) ?? 0

export function forwardToMain(action: ActionsUnion): void {
  const key: [number, number] = [messageChannel, ++messageCounter]
  updatePromise = getDBs().messaging.put(key, action)
}

let readMessages: Map<number, number>
export function initMessaging(numWorkers: number): void {
  readMessages = new Map()
  for (let i = 1; i <= numWorkers; i++) {
    readMessages.set(i, 0)
  }
}

export function dispatchActionFromWorkers(): void {
  const messagingDB = getDBs().messaging

  for (const [workerID, indexOfNextMessagesToRead] of readMessages.entries()) {
    let lastMessageFromWorker

    const rangeOptions = {
      start: [workerID, indexOfNextMessagesToRead],
      end: [workerID + 1, 0],
    }

    const iterator = messagingDB.getRange(rangeOptions)

    for (const {
      key: [workerID, messageIndex],
      value: action,
    } of iterator) {
      store.dispatch(action)
      lastMessageFromWorker = messageIndex
    }

    if (lastMessageFromWorker) {
      readMessages.set(workerID, lastMessageFromWorker)
    }
  }
}
