import { Span } from "opentracing"
import { IProgram } from "../commands/types"
import { Runner } from "../bootstrap/create-graphql-runner"
import { GraphQLRunner } from "../query/graphql-runner"
import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../redux/types"
import { Express } from "express"
// import JestWorker from "jest-worker"
import { IGatsbyWorkerPool } from "../utils/worker/pool"
import { Actor, AnyEventObject } from "xstate"
import { Compiler } from "webpack"
import { WebsocketManager } from "../utils/websocket-manager"
import { IWebpackWatchingPauseResume } from "../utils/start-server"
export interface IGroupedQueryIds {
  pageQueryIds: Array<string>
  staticQueryIds: Array<string>
}

export interface IMutationAction {
  type: string
  payload: Array<unknown>
  resolve?: (result: unknown) => void
}
export interface IBuildContext {
  program?: IProgram
  store?: Store<IGatsbyState, AnyAction>
  parentSpan?: Span
  gatsbyNodeGraphQLFunction?: Runner
  graphqlRunner?: GraphQLRunner
  queryIds?: IGroupedQueryIds
  webhookBody?: Record<string, unknown>
  webhookSourcePluginName?: string
  refresh?: boolean
  workerPool?: IGatsbyWorkerPool
  app?: Express
  nodesMutatedDuringQueryRun?: boolean
  nodesMutatedDuringQueryRunRecompileCount?: number
  mutationListener?: Actor<unknown, AnyEventObject>
  nodeMutationBatch?: Array<IMutationAction>
  compiler?: Compiler
  websocketManager?: WebsocketManager
  webpackWatching?: IWebpackWatchingPauseResume
  webpackListener?: Actor<unknown, AnyEventObject>
  queryFilesDirty?: boolean
  sourceFilesDirty?: boolean
  pendingQueryRuns?: Set<string>
}
