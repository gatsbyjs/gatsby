import { Span } from "opentracing"
import { IProgram } from "../commands/types"
import { Store } from "../.."
import { Runner } from "../bootstrap/create-graphql-runner"

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
  store?: Store
  parentSpan?: Span
  graphqlRunner?: Runner
  queryIds?: IGroupedQueryIds
  webhookBody?: Record<string, unknown>
}
