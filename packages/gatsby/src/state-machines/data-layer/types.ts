import { Span } from "opentracing"
import { IProgram } from "../../commands/types"
import { Runner } from "../../bootstrap/create-graphql-runner"
import { GraphQLRunner } from "../../query/graphql-runner"
import { Store, AnyAction } from "redux"
import { IGatsbyState } from "../../redux/types"
import JestWorker from "jest-worker"
export interface IGroupedQueryIds {
  pageQueryIds: Array<string>
  staticQueryIds: Array<string>
}

export interface IMutationAction {
  type: string
  payload: Array<unknown>
}
export interface IDataLayerContext {
  deferNodeMutation?: boolean
  nodesMutatedDuringQueryRun?: boolean
  program?: IProgram
  store?: Store<IGatsbyState, AnyAction>
  parentSpan?: Span
  gatsbyNodeGraphQLFunction?: Runner
  graphqlRunner?: GraphQLRunner
  webhookBody?: Record<string, unknown>
  webhookSourcePluginName?: string
  refresh?: boolean
  workerPool?: JestWorker
  pagesToBuild?: Array<string>
  pagesToDelete?: Array<string>
}
