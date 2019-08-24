/**
 * A type designed to be exposed as `PageInfo` over GraphQL.
 */
export interface PageInfo {
  hasPreviousPage: boolean | null
  hasNextPage: boolean | null
}

/**
 * A type designed to be exposed as a `Connection` over GraphQL.
 */
export interface Connection<T> {
  edges: Array<Edge<T>>
  pageInfo: PageInfo
}

/**
 * A type designed to be exposed as a `Edge` over GraphQL.
 */
export interface Edge<T> {
  node: T
  next: T
  previous: T
}

/**
 * A type describing the arguments a connection field receives in GraphQL.
 */
export interface ConnectionArguments {
  skip?: number | null
  limit?: number | null
}
