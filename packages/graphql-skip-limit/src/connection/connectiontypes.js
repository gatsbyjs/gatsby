/* @flow */

/**
 * A flow type designed to be exposed as `PageInfo` over GraphQL.
 */
export type PageInfo = {
  hasPreviousPage: ?boolean,
  hasNextPage: ?boolean,
};

/**
 * A flow type designed to be exposed as a `Connection` over GraphQL.
 */
export type Connection<T> = {
  edges: Array<Edge<T>>,
  pageInfo: PageInfo,
};

/**
 * A flow type designed to be exposed as a `Edge` over GraphQL.
 */
export type Edge<T> = {
  node: T,
  next: T,
  previous: T,
};

/**
 * A flow type describing the arguments a connection field receives in GraphQL.
 */
export type ConnectionArguments = {
  skip?: ?number,
  limit?: ?number,
};
