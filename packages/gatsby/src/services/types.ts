import { Span } from "opentracing"
import { IProgram } from "../commands/types"
import { Runner } from "../bootstrap/create-graphql-runner"
import { GraphQLRunner } from "../query/graphql-runner"
import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../redux/types"
import { Express } from "express"
import JestWorker from "jest-worker"
import { Actor, AnyEventObject } from "xstate"
import { Compiler } from "webpack"
import { WebsocketManager } from "../utils/websocket-manager"
import { IWebpackWatchingPauseResume } from "../utils/start-server"
export interface IGroupedQueryIds {
  pageQueryIds: string[]
  staticQueryIds: string[]
}

export interface IMutationAction {
  type: string
  payload: unknown[]
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
  refresh?: boolean
  workerPool?: JestWorker
  app?: Express
  nodesMutatedDuringQueryRun?: boolean
  mutationListener?: Actor<unknown, AnyEventObject>
  nodeMutationBatch?: IMutationAction[]
  compiler?: Compiler
  websocketManager?: WebsocketManager
  webpackWatching?: IWebpackWatchingPauseResume
  webpackListener?: Actor<unknown, AnyEventObject>
  queryFilesDirty?: boolean
  sourceFilesDirty?: boolean
}
