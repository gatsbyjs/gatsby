import {
  AnyEventObject,
  ServiceConfig,
  MachineConfig,
  ActionFunctionMap,
  StateSchema,
} from "xstate"
import { PackageJson, Store } from "."
import { Compiler } from "webpack"
import { Span } from "opentracing"
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

export interface IProgram {
  directory: string
  sitePackageJson: PackageJson
  noUglify: boolean
  host: string
  port: string
  version: string
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface GraphQLRunner {
  nodeModel: any
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
  websocketManager?: unknown
  store?: Store
  parentSpan?: Span
  graphqlRunner?: GraphQLRunner
  refresh?: boolean
  webhookBody?: Record<string, unknown>
  queryIds?: IGroupedQueryIds
  workerPool?: JestWorker
  pagesToBuild?: string[]
  pagesToDelete?: string[]
}

export const buildServices: Record<string, ServiceConfig<IBuildContext>>
export const INITIAL_CONTEXT: IBuildContext
export const idleStates: MachineConfig<
  IBuildContext,
  StateSchema,
  AnyEventObject
>
export const runningStates: MachineConfig<
  IBuildContext,
  StateSchema,
  AnyEventObject
>
export const buildActions: ActionFunctionMap<
  IBuildContext,
  AnyEventObject
>
