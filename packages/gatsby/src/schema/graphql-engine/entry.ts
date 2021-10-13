import { ExecutionResult, Source } from "graphql"
import "../../utils/engines-fs-provider"
import { uuid } from "gatsby-core-utils"
import { build } from "../index"
import { setupLmdbStore } from "../../datastore/lmdb/lmdb-datastore"
import { store } from "../../redux"
import { actions } from "../../redux/actions"
import reporter from "gatsby-cli/lib/reporter"
import {
  createGraphQLRunner,
  Runner,
} from "../../bootstrap/create-graphql-runner"
import { waitJobsByRequest } from "../../utils/wait-until-jobs-complete"

import { setGatsbyPluginCache } from "../../utils/require-gatsby-plugin"
import apiRunnerNode from "../../utils/api-runner-node"
import type { IGatsbyPage, IGatsbyState } from "../../redux/types"
import { findPageByPath } from "../../utils/find-page-by-path"
import { runWithEngineContext } from "../../utils/engine-context"
import { getDataStore } from "../../datastore"
import {
  gatsbyNodes,
  gatsbyWorkers,
  flattenedPlugins,
  // @ts-ignore
} from ".cache/query-engine-plugins"

export class GraphQLEngine {
  // private schema: GraphQLSchema
  private runnerPromise?: Promise<Runner>

  constructor({ dbPath }: { dbPath: string }) {
    setupLmdbStore({ dbPath })
    // start initializing runner ASAP
    this.getRunner()
  }

  private async _doGetRunner(): Promise<Runner> {
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

    return createGraphQLRunner(store, reporter)
  }

  private async getRunner(): Promise<Runner> {
    if (!this.runnerPromise) {
      this.runnerPromise = this._doGetRunner()
    }
    return this.runnerPromise
  }

  public async ready(): Promise<void> {
    // We don't want to expose internal runner freely. We do expose `runQuery` function already.
    // The way internal runner works can change, so we should not make it a public API.
    // Here we just want to expose way to await it being ready
    await this.getRunner()
  }

  public async runQuery(
    query: string | Source,
    context: Record<string, any>
  ): Promise<ExecutionResult> {
    const engineContext = {
      requestId: uuid.v4(),
    }
    const doRunQuery = async (): Promise<ExecutionResult> => {
      const graphqlRunner = await this.getRunner()
      const result = await graphqlRunner(query, context)
      await waitJobsByRequest(engineContext.requestId)
      return result
    }
    try {
      return await runWithEngineContext(engineContext, doRunQuery)
    } finally {
      // Reset job-to-request mapping
      store.dispatch({
        type: `CLEAR_JOB_V2_CONTEXT`,
        payload: engineContext,
      })
    }
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
