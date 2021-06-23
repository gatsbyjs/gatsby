import * as path from "path"
import fs from "fs-extra"
import type { watch as ChokidarWatchType } from "chokidar"
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
import { IGroupedQueryIds } from "../../../services"
import { runQueriesInWorkersQueue } from "../pool"

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

const dummyPageElias = {
  path: `/elias`,
  componentPath: `/elias.js`,
  component: `/elias.js`,
  query: `{ nodeTypeOne { number } }`,
  internalComponentName: `Component/elias/`,
  matchPath: undefined,
  componentChunkName: `component--elias`,
  isCreatedByStatefulCreatePages: true,
  context: {},
  updatedAt: 1,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pluginCreator___NODE: `elias`,
  pluginCreatorId: `elias`,
  ownerNodeId: `elias`,
}

const dummyPageLaia = {
  path: `/laia`,
  componentPath: `/laia.js`,
  component: `/laia.js`,
  query: `query($var: Boolean) { nodeTypeOne { default: fieldWithArg, fieldWithArg(isCool: true), withVar: fieldWithArg(isCool: $var) } }`,
  internalComponentName: `Component/laia/`,
  matchPath: undefined,
  componentChunkName: `component--laia`,
  isCreatedByStatefulCreatePages: true,
  context: {
    var: true,
  },
  updatedAt: 1,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pluginCreator___NODE: `laia`,
  pluginCreatorId: `laia`,
  ownerNodeId: `laia`,
}

const dummyStaticQuery = {
  id: `sq--book`,
  name: `book-name`,
  componentPath: `/static-query-component.js`,
  query: `{ nodeTypeOne { resolverField } }`,
  hash: `book-hash`,
}

const queryIds: IGroupedQueryIds = {
  pageQueryIds: [dummyPageElias, dummyPageLaia],
  staticQueryIds: [dummyStaticQuery.id],
}

describeWhenLMDB(`worker (pool)`, () => {
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

    store.dispatch({
      type: `CREATE_PAGE`,
      plugin: {
        id: `gatsby-plugin-test`,
        name: `gatsby-plugin-test`,
        version: `1.0.0`,
      },
      payload: {
        path: dummyPageElias.path,
        componentPath: dummyPageElias.componentPath,
        component: dummyPageElias.component,
      },
    })

    store.dispatch({
      type: `CREATE_PAGE`,
      plugin: {
        id: `gatsby-plugin-test`,
        name: `gatsby-plugin-test`,
        version: `1.0.0`,
      },
      payload: {
        path: dummyPageLaia.path,
        componentPath: dummyPageLaia.componentPath,
        component: dummyPageLaia.component,
      },
    })

    saveStateForWorkers([`inferenceMetadata`])

    store.dispatch({
      type: `QUERY_EXTRACTED`,
      plugin: {
        id: `gatsby-plugin-test`,
        name: `gatsby-plugin-test`,
        version: `1.0.0`,
      },
      payload: {
        componentPath: dummyPageElias.componentPath,
        query: dummyPageElias.query,
      },
    })

    store.dispatch({
      type: `QUERY_EXTRACTED`,
      plugin: {
        id: `gatsby-plugin-test`,
        name: `gatsby-plugin-test`,
        version: `1.0.0`,
      },
      payload: {
        componentPath: dummyPageLaia.componentPath,
        query: dummyPageLaia.query,
      },
    })

    store.dispatch({
      type: `REPLACE_STATIC_QUERY`,
      plugin: {
        id: `gatsby-plugin-test`,
        name: `gatsby-plugin-test`,
        version: `1.0.0`,
      },
      payload: dummyStaticQuery,
    })

    saveStateForWorkers([`components`, `staticQueryComponents`])

    await worker.buildSchema()
    await runQueriesInWorkersQueue(worker, queryIds)
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

  it(`should execute static queries`, async () => {
    const stateFromWorker = await worker!.getState()

    const staticQueryResult = await fs.readJson(
      `${stateFromWorker.program.directory}/public/page-data/sq/d/${dummyStaticQuery.hash}.json`
    )

    expect(staticQueryResult).toStrictEqual({
      data: {
        nodeTypeOne: {
          resolverField: `Custom String`,
        },
      },
    })
  })

  it(`should execute page queries`, async () => {
    const stateFromWorker = await worker!.getState()

    const pageQueryResult = await fs.readJson(
      `${stateFromWorker.program.directory}/.cache/json/_elias.json`
    )

    expect(pageQueryResult.data).toStrictEqual({
      nodeTypeOne: {
        number: 123,
      },
    })
  })

  it(`should execute page queries with context variables`, async () => {
    const stateFromWorker = await worker!.getState()

    const pageQueryResult = await fs.readJson(
      `${stateFromWorker.program.directory}/.cache/json/_laia.json`
    )

    expect(pageQueryResult.data).toStrictEqual({
      nodeTypeOne: {
        default: `You are not cool`,
        fieldWithArg: `You are cool`,
        withVar: `You are cool`,
      },
    })
  })
})
