import DataLoader from "dataloader"
import { ApolloLink, Observable, Operation, FetchResult } from "apollo-link"
import { print } from "graphql"
import { IQuery, IQueryResult, merge, resolveResult } from "./merge-queries"

interface IOptions {
  uri: string
  fetch: Function
  fetchOptions?: object
  dataLoaderOptions?: object
  headers?: object
}

export function createDataloaderLink(options: IOptions): ApolloLink {
  const load = async (keys: ReadonlyArray<IQuery>): Promise<IQueryResult[]> => {
    const query = merge(keys)
    const result: object = await request(query, options)
    if (!isValidGraphQLResult(result)) {
      const error: any = new Error(
        `Failed to load query batch:\n${formatErrors(result)}`
      )
      error.name = `GraphQLError`
      error.originalResult = result
      throw error
    }
    return resolveResult(result)
  }

  const concurrency =
    Number(process.env.GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY) || 4

  const maxBatchSize = Math.min(4, Math.round(concurrency / 5))

  const dataloader = new DataLoader(load, {
    cache: false,
    maxBatchSize,
    batchScheduleFn: (callback): any => setTimeout(callback, 50),
    ...options.dataLoaderOptions,
  })

  return new ApolloLink(
    (operation: Operation): Observable<FetchResult> =>
      new Observable(observer => {
        const { query, variables } = operation

        dataloader
          .load({ query, variables })
          .then(response => {
            operation.setContext({ response })
            observer.next(response)
            observer.complete()
            return response
          })
          .catch(err => {
            if (err.name === `AbortError`) {
              return
            }
            observer.error(err)
          })
      })
  )
}

function formatErrors(result: any): string {
  if (result?.errors?.length > 0) {
    return result.errors
      .map(error => {
        const { message, path = [] } = error
        return path.length > 0
          ? `${message} (path: ${JSON.stringify(path)})`
          : message
      })
      .join(`\n`)
  }
  return `Unexpected GraphQL result`
}

function isValidGraphQLResult(response): response is IQueryResult {
  return (
    response &&
    response.data &&
    (!response.errors || response.errors.length === 0)
  )
}

async function request(query: IQuery, options: IOptions): Promise<object> {
  const { uri, headers = {}, fetch, fetchOptions } = options

  const body = JSON.stringify({
    query: print(query.query),
    variables: query.variables,
  })
  const response = await fetch(uri, {
    method: `POST`,
    ...fetchOptions,
    headers: Object.assign({ "Content-Type": `application/json` }, headers),
    body,
  })
  return response.json()
}
