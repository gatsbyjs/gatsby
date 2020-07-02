import PQueue, { Options as PQueueOptions } from "p-queue"
import fetch, { RequestInit as FetchOptions } from "node-fetch"
import { IQueryExecutionArgs, IQueryExecutor } from "../types"
import { ExecutionResult } from "graphql"

export function createNetworkQueryExecutor(
  uri: string,
  fetchOptions: FetchOptions = {}
): IQueryExecutor {
  return async function execute(args): Promise<ExecutionResult> {
    const { query, variables, operationName } = args

    return fetch(uri, {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`,
      },
      body: JSON.stringify({ query, variables, operationName }),
      ...fetchOptions,
    }).then(res => res.json())
  }
}

/**
 * Takes existing query `executor` function and creates a new
 * function with the same signature that runs with given
 * concurrency level (`10` by default).
 *
 * See p-queue library docs for all available `queueOptions`
 */
export function wrapQueryExecutorWithQueue(
  executor: IQueryExecutor,
  queueOptions: PQueueOptions<any, any> = { concurrency: 10 }
): IQueryExecutor {
  const queryQueue = new PQueue(queueOptions)

  return async function executeQueued(
    args: IQueryExecutionArgs
  ): Promise<ExecutionResult> {
    return await queryQueue.add(() => executor(args))
  }
}

/**
 * Creates default query executor suitable for sourcing config
 */
export function createDefaultQueryExecutor(
  uri: string,
  fetchOptions: FetchOptions,
  queueOptions: PQueueOptions<any, any> = { concurrency: 10 }
): IQueryExecutor {
  const executor = createNetworkQueryExecutor(uri, fetchOptions)

  return wrapQueryExecutorWithQueue(executor, queueOptions)
}
