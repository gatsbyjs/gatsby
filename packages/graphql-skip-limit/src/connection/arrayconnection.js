/* @flow */

import type { Connection, ConnectionArguments, Edge } from "./connectiontypes"

/**
 * A simple function that accepts an array and connection arguments, and returns
 * a connection object for use in GraphQL. It uses array offsets as pagination,
 * so pagination will only work if the array is static.
 */
export function connectionFromArray<T>(
  data: Array<T>,
  args: ConnectionArguments
): Connection<T> {
  const { skip, limit } = args
  let startSlice = 0
  let endSlice = data.length

  if (typeof skip === `number`) {
    if (skip < 0) {
      throw new Error(`Argument "skip" must be a non-negative integer`)
    }

    startSlice = skip
  }
  if (typeof limit === `number`) {
    if (limit < 0) {
      throw new Error(`Argument "limit" must be a non-negative integer`)
    }

    endSlice = startSlice + limit
  }

  const slice = data.slice(startSlice, endSlice)
  const edges = slice.map((value: any, index: number) => {
    const orgIndex = startSlice + index
    let next
    let previous
    if (orgIndex + 1 < data.length) {
      next = data[orgIndex + 1]
    }
    if (orgIndex !== 0) {
      previous = data[orgIndex - 1]
    }
    return {
      node: value,
      next,
      previous,
    }
  })

  return {
    edges,
    pageInfo: {
      hasNextPage: typeof limit === `number`
        ? limit + startSlice - 1 < data.length
        : false,
    },
  }
}

/**
 * A version of `connectionFromArray` that takes a promised array, and returns a
 * promised connection.
 */
export function connectionFromPromisedArray<T>(
  dataPromise: Promise<Array<T>>,
  args: ConnectionArguments
): Promise<Connection<T>> {
  return dataPromise.then(data => connectionFromArray(data, args))
}
