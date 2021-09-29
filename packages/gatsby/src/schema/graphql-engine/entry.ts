import "../../utils/engines-fs-provider"
import { build } from "../index"
import { setupLmdbStore } from "../../datastore/lmdb/lmdb-datastore"
import { store } from "../../redux"
import { actions } from "../../redux/actions"
import { GraphQLRunner } from "../../query/graphql-runner"
import { waitUntilAllJobsComplete } from "../../utils/wait-until-jobs-complete"

import { setGatsbyPluginCache } from "../../utils/require-gatsby-plugin"
import apiRunnerNode from "../../utils/api-runner-node"
import type { IGatsbyPage, IGatsbyState } from "../../redux/types"
import { findPageByPath } from "../../utils/find-page-by-path"
import { getDataStore } from "../../datastore"
import {
  gatsbyNodes,
  gatsbyWorkers,
  flattenedPlugins,
  // @ts-ignore
} from ".cache/query-engine-plugins"
import { initTracer } from "../../utils/tracer"

initTracer(process.env.GATSBY_OPEN_TRACING_CONFIG_FILE ?? ``)

export class GraphQLEngine {
  // private schema: GraphQLSchema
  private runnerPromise?: Promise<GraphQLRunner>

  constructor({ dbPath }: { dbPath: string }) {
    setupLmdbStore({ dbPath })
    // start initializing runner ASAP
    this.getRunner()
  }

  private async _doGetRunner(): Promise<GraphQLRunner> {
    // @ts-ignore SCHEMA_SNAPSHOT is being "inlined" by bundler
    store.dispatch(actions.createTypes(SCHEMA_SNAPSHOT))

    // TODO: FLATTENED_PLUGINS needs to be merged with plugin options from gatsby-config
    //  (as there might be non-serializable options, i.e. functions)
    store.dispatch({
      type: `SET_SITE_FLATTENED_PLUGINS`,
      payload: flattenedPlugins,
    })

    for (const pluginName of Object.keys(gatsbyNodes)) {
      setGatsbyPluginCache(
        { name: pluginName, resolve: `` },
        `gatsby-node`,
        gatsbyNodes[pluginName]
      )
    }
    for (const pluginName of Object.keys(gatsbyWorkers)) {
      setGatsbyPluginCache(
        { name: pluginName, resolve: `` },
        `gatsby-worker`,
        gatsbyWorkers[pluginName]
      )
    }
    if (_CFLAGS_.GATSBY_MAJOR === `4`) {
      await apiRunnerNode(`onPluginInit`)
    } else {
      await apiRunnerNode(`unstable_onPluginInit`)
    }
    await apiRunnerNode(`createSchemaCustomization`)

    // Build runs
    // Note: skipping inference metadata because we rely on schema snapshot
    await build({ fullMetadataBuild: false })

    return new GraphQLRunner(store) // createGraphQLRunner(store, reporter)
  }

  private async getRunner(): Promise<GraphQLRunner> {
    if (!this.runnerPromise) {
      this.runnerPromise = this._doGetRunner()
    }
    return this.runnerPromise
  }

  public async runQuery(
    ...args: Parameters<GraphQLRunner["query"]>
  ): ReturnType<GraphQLRunner["query"]> {
    const graphqlRunner = await this.getRunner()
    if (args.length < 2) {
      // context
      args.push({})
    }
    if (args.length < 3) {
      // options
      args.push({
        queryName: `GraphQL Engine query`,
      })
    }
    const result = await graphqlRunner.query(...args)
    // Def not ideal - this is just waiting for all jobs and not jobs for current
    // query, but we don't track jobs per query right now
    // TODO: start tracking jobs per query to be able to await just those
    await waitUntilAllJobsComplete()
    return result
  }

  public findPageByPath(pathName: string): IGatsbyPage | undefined {
    // adapter so `findPageByPath` use SitePage nodes in datastore
    // instead of `pages` redux slice
    const state = {
      pages: {
        get(pathName: string): IGatsbyPage | undefined {
          return getDataStore().getNode(`SitePage ${pathName}`) as
            | IGatsbyPage
            | undefined
        },
        values(): Iterable<IGatsbyPage> {
          return getDataStore().iterateNodesByType(
            `SitePage`
          ) as Iterable<IGatsbyPage>
        },
      },
    } as unknown as IGatsbyState

    return findPageByPath(state, pathName, false)
  }
}

export default { GraphQLEngine }
