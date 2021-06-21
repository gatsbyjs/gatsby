import * as path from "path"
import fs from "fs-extra"
import type { watch as ChokidarWatchType } from "chokidar"
import { CombinedState } from "redux"
import { build } from "../../../schema"
import sourceNodesAndRemoveStaleNodes from "../../source-nodes"
import { saveStateForWorkers, store } from "../../../redux"
import { loadConfigAndPlugins } from "../../../bootstrap/load-config-and-plugins"
import {
  createTestWorker,
  describeWhenLMDB,
  GatsbyTestWorkerPool,
} from "./test-helpers"
import { getDataStore } from "../../../datastore"
import { IGatsbyState } from "../../../redux/types"
import { extractQueries } from "../../../services"

let worker: GatsbyTestWorkerPool | undefined

// when we load config and run sourceNodes on "main process" we start file watchers
// because of default `gatsby-plugin-page-creator` which would prevent test process from
// exiting gracefully without forcing exit
// to prevent that we keep track of created watchers and close them after all tests are done
const mockWatchersToClose = new Set<ReturnType<typeof ChokidarWatchType>>()
jest.mock(`chokidar`, () => {
  const chokidar = jest.requireActual(`chokidar`)
  const originalChokidarWatch = chokidar.watch

  chokidar.watch = (
    ...args: Parameters<typeof ChokidarWatchType>
  ): ReturnType<typeof ChokidarWatchType> => {
    const watcher = originalChokidarWatch.call(chokidar, ...args)
    mockWatchersToClose.add(watcher)
    return watcher
  }

  return chokidar
})

describeWhenLMDB(`worker (queries)`, () => {
  let stateFromWorker: CombinedState<IGatsbyState>

  beforeAll(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    const fileDir = path.join(process.cwd(), `.cache/redux`)
    await fs.emptyDir(fileDir)

    worker = createTestWorker()

    const siteDirectory = path.join(__dirname, `fixtures`, `sample-site`)
    await loadConfigAndPlugins({ siteDirectory })
    await worker.loadConfigAndPlugins({ siteDirectory })
    await sourceNodesAndRemoveStaleNodes({ webhookBody: {} })
    await getDataStore().ready()

    await build({ parentSpan: {} })

    saveStateForWorkers([`inferenceMetadata`])
    await extractQueries({})
    saveStateForWorkers([`components`, `staticQueryComponents`])
    await worker.buildSchema()

    stateFromWorker = await worker.getState()

    console.log(stateFromWorker)
  })

  afterAll(() => {
    if (worker) {
      worker.end()
      worker = undefined
    }
    for (const watcher of mockWatchersToClose) {
      watcher.close()
    }
  })

  it(`should have expected initial state for state.queries`, () => {
    expect(stateFromWorker.queries).toMatchInlineSnapshot(`
      Object {
        "byConnection": Object {},
        "byNode": Object {},
        "deletedQueries": Object {},
        "dirtyQueriesListToEmitViaWebsocket": Array [],
        "queryNodes": Object {},
        "trackedComponents": Object {},
        "trackedQueries": Object {},
      }
    `)
  })
})
