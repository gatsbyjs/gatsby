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

const dummyPageFoo = {
  path: `/foo`,
  componentPath: `/foo.js`,
  component: `/foo.js`,
  query: `{ nodeTypeOne { number } }`,
  internalComponentName: `Component/foo/`,
  matchPath: undefined,
  componentChunkName: `component--foo`,
  isCreatedByStatefulCreatePages: true,
  context: {},
  updatedAt: 1,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pluginCreator___NODE: `foo`,
  pluginCreatorId: `foo`,
  ownerNodeId: `foo`,
}

const dummyPageBar = {
  path: `/bar`,
  componentPath: `/bar.js`,
  component: `/bar.js`,
  query: `query($var: Boolean) { nodeTypeOne { default: fieldWithArg, fieldWithArg(isCool: true), withVar: fieldWithArg(isCool: $var) } }`,
  internalComponentName: `Component/bar/`,
  matchPath: undefined,
  componentChunkName: `component--bar`,
  isCreatedByStatefulCreatePages: true,
  context: {
    var: true,
  },
  updatedAt: 1,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  pluginCreator___NODE: `bar`,
  pluginCreatorId: `bar`,
  ownerNodeId: `bar`,
}

const dummyStaticQuery = {
  id: `sq--q1`,
  name: `q1-name`,
  componentPath: `/static-query-component.js`,
  query: `{ nodeTypeOne { resolverField } }`,
  hash: `q1-hash`,
}

const queryIds: IGroupedQueryIds = {
  pageQueryIds: [dummyPageFoo, dummyPageBar],
  staticQueryIds: [dummyStaticQuery.id],
}

describeWhenLMDB(`worker (queries)`, () => {
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
        path: dummyPageFoo.path,
        componentPath: dummyPageFoo.componentPath,
        component: dummyPageFoo.component,
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
        path: dummyPageBar.path,
        componentPath: dummyPageBar.componentPath,
        component: dummyPageBar.component,
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
        componentPath: dummyPageFoo.componentPath,
        query: dummyPageFoo.query,
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
        componentPath: dummyPageBar.componentPath,
        query: dummyPageBar.query,
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
    await worker.runQueries(queryIds)
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
      `${stateFromWorker.program.directory}/.cache/json/_foo.json`
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
      `${stateFromWorker.program.directory}/.cache/json/_bar.json`
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
