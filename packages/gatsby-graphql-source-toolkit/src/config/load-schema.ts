import {
  buildClientSchema,
  getIntrospectionQuery,
  IntrospectionQuery,
  GraphQLSchema,
} from "graphql"
import { IQueryExecutor } from "../types"

export async function introspectSchema(
  execute: IQueryExecutor
): Promise<IntrospectionQuery> {
  const introspectionResult = await execute({
    query: getIntrospectionQuery(),
    operationName: `IntrospectionQuery`,
    variables: {},
  })

  if (!introspectionResult.data || introspectionResult.errors?.length) {
    const error = introspectionResult.errors?.length
      ? introspectionResult.errors[0].message
      : ``
    throw new Error(`Schema introspection failed. First error: ${error}`)
  }

  return introspectionResult.data as IntrospectionQuery
}

/**
 * Executes GraphQL introspection query using provided query executor
 * and creates an instance of GraphQL Schema using `buildClientSchema`
 * utility from `graphql-js` package.
 */
export async function loadSchema(
  execute: IQueryExecutor
): Promise<GraphQLSchema> {
  const introspectionResult = await introspectSchema(execute)
  return buildClientSchema(introspectionResult)
}
