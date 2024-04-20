import type { GraphQLSchema } from "graphql"
import type { SchemaComposer } from "graphql-compose"

import { createPageDependency } from "../redux/actions/add-page-dependency"
import { LocalNodeModel } from "./node-model"
import { defaultFieldResolver } from "./resolvers"
import type { IGraphQLRunnerStats } from "../query/types"
import type {
  IGatsbyResolverContext,
  IGraphQLSpanTracer,
  IGraphQLTelemetryRecord,
} from "./type-definitions"

export default function withResolverContext<TSource, TArgs>({
  schema,
  schemaComposer,
  context,
  customContext,
  nodeModel,
  stats,
  tracer,
  telemetryResolverTimings,
}: {
  schema: GraphQLSchema
  schemaComposer: SchemaComposer<IGatsbyResolverContext<TSource, TArgs>> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any> | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customContext?: Record<string, any> | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeModel?: any | undefined
  stats?: IGraphQLRunnerStats | null
  tracer?: IGraphQLSpanTracer | undefined
  telemetryResolverTimings?: Array<IGraphQLTelemetryRecord> | undefined
}): IGatsbyResolverContext<TSource, TArgs> {
  if (!nodeModel) {
    nodeModel = new LocalNodeModel({
      schema,
      schemaComposer,
      createPageDependency,
      _rootNodeMap: new Map(),
      _trackedRootNodes: new Map(),
    })
  }

  return {
    ...(context || {}),
    ...(customContext || {}),
    defaultFieldResolver,
    nodeModel: nodeModel.withContext({
      path: context ? context.path : undefined,
    }),
    stats: stats || null,
    tracer: tracer || null,
    telemetryResolverTimings,
  }
}

module.exports = withResolverContext
