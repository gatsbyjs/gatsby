import { Connection, ConnectionArguments } from "./connectiontypes"

export function connectionFromArray<T>(
  data: T[],
  args: ConnectionArguments
): Connection<T>

export function connectionFromPromisedArray<T>(
  dataPromise: Promise<Array<T>>,
  args: ConnectionArguments
): Promise<Connection<T>>
