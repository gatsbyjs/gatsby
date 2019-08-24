import { Connection, ConnectionArguments } from "./connectiontypes"

export function connectionFromArray<T>(
  data: T[],
  args: ConnectionArguments
): Connection<T>

export function connectionFromPromisedArray<T>(
  dataPromise: Promise<T[]>,
  args: ConnectionArguments
): Promise<Connection<T>>
