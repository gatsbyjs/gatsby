import { GraphQLSchema } from "graphql"
import { SchemaComposer } from "graphql-compose"

import { createPageDependency } from "../redux/actions/add-page-dependency"
import { LocalNodeModel } from "./node-model"
import { defaultFieldResolver } from "./resolvers"
import { IGraphQLRunnerStats } from "../query/types"
import { IGatsbyResolverContext, IGraphQLSpanTracer } from "./type-definitions"

export default function withResolverContext<TSource, TArgs>({
  schema,
  schemaComposer,
  context,
  customContext,
  nodeModel,
  stats,
  tracer,
}: {
  schema: GraphQLSchema
  schemaComposer: SchemaComposer<IGatsbyResolverContext<TSource, TArgs>> | null
  context?: Record<string, any>
  customContext?: Record<string, any>
  nodeModel?: any
  stats?: IGraphQLRunnerStats | null
  tracer?: IGraphQLSpanTracer
}): IGatsbyResolverContext<TSource, TArgs> {
  if (!nodeModel) {
    nodeModel = new LocalNodeModel({
      schema,
      schemaComposer,
      createPageDependency,
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
  }
}

module.exports = withResolverContext
