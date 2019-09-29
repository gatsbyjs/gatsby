/**
 * @typedef {Object} PageInfo
 * A type designed to be exposed as `PageInfo` over GraphQL.
 * @param {boolean | null} hasPreviousPage
 * @param {boolean | null} hasNextPage
 */

/**
 * @typedef {Object} Connection
 * A type designed to be exposed as a `Connection` over GraphQL.
 * @template T
 * @param {Edge<T>[]} edges
 * @param {PageInfo} pageInfo
 */

/**
 * @typedef {Object} Edges
 * A type designed to be exposed as a `Edge` over GraphQL.
 * @template T
 * @param {T} node
 * @param {T} next
 * @param {T} previous
 */

/**
 * @typedef {Object} ConnectionArguments
 * A type describing the arguments a connection field receives in GraphQL.
 * @param {number | null} [skip]
 * @param {number | null} [limit]
 */
