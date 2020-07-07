import { Span } from "opentracing"
import { IProgram } from "../commands/types"
import { Runner } from "../bootstrap/create-graphql-runner"
import { GraphQLRunner } from "../query/graphql-runner"
import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../redux/types"
import { Express } from "express"
import JestWorker from "jest-worker"
export interface IGroupedQueryIds {
  pageQueryIds: string[]
  staticQueryIds: string[]
}

export interface IMutationAction {
  type: string
  payload: unknown[]
}
export interface IBuildContext {
  firstRun: boolean
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
}
