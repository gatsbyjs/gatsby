import { GraphQLSchema } from "graphql"
import { SchemaComposer } from "graphql-compose"

import { createPageDependency } from "../redux/actions/add-page-dependency"
import { LocalNodeModel } from "./node-model"
import { defaultFieldResolver } from "./resolvers"
import { IGraphQLRunnerStats } from "../query/types"
import { IGatsbyResolverContext, IGraphQLSpanTracer } from "./type-definitions"

import { store } from "../redux"

import { registerModuleInternal as registerModule } from "../redux/actions/modules/register-module"
import { addModuleDependencyToQueryResult } from "../redux/actions/internal"
import { generateModuleId } from "../utils/generate-module-id"

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

  const addModuleDependency = ({
    source,
    type = `default`,
    importName,
  }: {
    source: string
    type?: string
    importName?: string
  }): string => {
    if (!context?.path) {
      throw new Error(`Adding modules doesn't work in gatsby-node`)
    }

    if (context.path.startsWith(`sq--`)) {
      throw new Error(`Adding modules in static queries not implemented (yet)`)
    }

    // TO-DO: validation:
    // - check if source is absolute path
    // - check if type is one of the allowed values: `default`, `named`, `namespace`
    // - if type is `named` - make sure `importName` is set

    const moduleID = generateModuleId({ source, type, importName })

    if (!store.getState().modules.has(moduleID)) {
      store.dispatch(
        registerModule({
          moduleID,
          source,
          type,
          importName,
        })
      )
    }

    store.dispatch(
      addModuleDependencyToQueryResult({
        path: context.path,
        moduleID,
      })
    )

    return moduleID
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
    pageModel: {
      setModule: addModuleDependency,
    },
  }
}

module.exports = withResolverContext
