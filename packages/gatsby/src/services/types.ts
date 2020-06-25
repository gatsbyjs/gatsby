import { WebsocketManager } from "../utils/websocket-manager"
import { AnyEventObject, Actor } from "xstate"
import { Compiler } from "webpack"
import { Span } from "opentracing"
import { Express } from "express"
import JestWorker from "jest-worker"
import { IProgram } from "../commands/types"
import { Runner } from "../bootstrap/create-graphql-runner"
import { GraphQLRunner } from "../query/graphql-runner"
import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../redux/types"

export interface IGroupedQueryIds {
  pageQueryIds: string[]
  staticQueryIds: string[]
}

export interface IMutationAction {
  type: string
  payload: unknown[]
}
export interface IBuildContext {
  program?: IProgram
  recursionCount: number
  nodesMutatedDuringQueryRun: boolean
  firstRun: boolean
  nodeMutationBatch: IMutationAction[]
  filesDirty?: boolean
  runningBatch: IMutationAction[]
  compiler?: Compiler
  websocketManager?: WebsocketManager
  store?: Store<IGatsbyState, AnyAction>
  parentSpan?: Span
  gatsbyNodeGraphQLFunction?: Runner
  graphqlRunner?: GraphQLRunner
  refresh?: boolean
  webhookBody?: Record<string, unknown>
  queryIds?: IGroupedQueryIds
  workerPool?: JestWorker
  mutationListener?: Actor<any, AnyEventObject>
  app?: Express
  pagesToBuild?: string[]
  pagesToDelete?: string[]
}
