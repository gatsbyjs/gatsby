import { Span } from "opentracing"
import { IProgram } from "../commands/types"
import { Store } from "../.."
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
  store?: Store
  parentSpan?: Span
  graphqlRunner?: GraphQLRunner
  queryIds?: IGroupedQueryIds
}
