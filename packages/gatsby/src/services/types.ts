import type { Span } from "opentracing"
import reporter from "gatsby-cli/lib/reporter"
import type { IProgram } from "../commands/types"
import type { Runner } from "../bootstrap/create-graphql-runner"
import { GraphQLRunner } from "../query/graphql-runner"
import type { Store, AnyAction } from "redux"
import type { IGatsbyPage, IGatsbyState } from "../redux/types"
import type { Express } from "express"
import type { GatsbyWorkerPool } from "../utils/worker/pool"
import type { Actor, AnyEventObject } from "xstate"
import { Compiler } from "webpack"
import { WebsocketManager } from "../utils/websocket-manager"
import type { IWebpackWatchingPauseResume } from "../utils/start-server"

type Reporter = typeof reporter

export type IGroupedQueryIds = {
  pageQueryIds: Array<IGatsbyPage>
  staticQueryIds: Array<string>
  sliceQueryIds: Array<string>
}

export type IMutationAction = {
  type: string
  payload: Array<unknown>
  resolve?: ((result: unknown) => void) | undefined
}

export type IBuildContext = {
  reporter?: Reporter | undefined
  shouldRunInitialTypegen?: boolean | undefined
  program: IProgram
  store?: Store<IGatsbyState, AnyAction> | undefined
  parentSpan?: Span | undefined
  gatsbyNodeGraphQLFunction?: Runner | undefined
  graphqlRunner?: GraphQLRunner | undefined
  queryIds?: IGroupedQueryIds | undefined
  webhookBody?: Record<string, unknown> | undefined
  webhookSourcePluginName?: string | undefined
  refresh?: boolean | undefined
  workerPool?: GatsbyWorkerPool | undefined
  app?: Express | undefined
  nodesMutatedDuringQueryRun?: boolean | undefined
  nodesMutatedDuringQueryRunRecompileCount?: number | undefined
  mutationListener?: Actor<unknown, AnyEventObject> | undefined
  nodeMutationBatch?: Array<IMutationAction> | undefined
  compiler?: Compiler | undefined
  websocketManager?: WebsocketManager | undefined
  webpackWatching?: IWebpackWatchingPauseResume | undefined
  webpackListener?: Actor<unknown, AnyEventObject> | undefined
  queryFilesDirty?: boolean | undefined
  sourceFilesDirty?: boolean | undefined
  changedSourceFiles?: Set<string> | undefined // not available in "recompile" service
  recompiledFiles?: Set<string> | undefined // available in "recompile" service
  pendingQueryRuns?: Set<string> | undefined
}
