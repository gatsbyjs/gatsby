import { WebsocketManager } from "../utils/websocket-manager"
import { AnyEventObject, Actor } from "xstate"
import { Compiler } from "webpack"
import { Span } from "opentracing"
import { Express } from "express"
import JestWorker from "jest-worker"
import { IProgram } from "../commands/types"
import { Store } from "../.."
import { Runner } from "../bootstrap/create-graphql-runner"
import { GraphQLRunner } from "../query/graphql-runner"

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
  app?: Express
  recursionCount: number
  nodesMutatedDuringQueryRun: boolean
  firstRun: boolean
  nodeMutationBatch: IMutationAction[]
  filesDirty?: boolean
  runningBatch: IMutationAction[]
  compiler?: Compiler
  websocketManager?: WebsocketManager
  store?: Store
  parentSpan?: Span
  bootstrapGraphQLFunction?: Runner
  graphqlRunner?: GraphQLRunner
  refresh?: boolean
  webhookBody?: Record<string, unknown>
  queryIds?: IGroupedQueryIds
  workerPool?: JestWorker
  pagesToBuild?: string[]
  pagesToDelete?: string[]
  mutationListener?: Actor<any, AnyEventObject>
}
