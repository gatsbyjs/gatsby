import fs from "fs-extra"
import * as path from "path"
// we want to force posix-style joins, so Windows doesn't produce backslashes for urls
const { join } = path.posix
import type { IScriptsAndStyles } from "./client-assets-for-template"
import { IPageDataWithQueryResult } from "./page-data"

export const getStaticQueryPath = (hash: string): string =>
  join(`page-data`, `sq`, `d`, `${hash}.json`)

export const getStaticQueryResult = async (hash: string): Promise<any> => {
  const staticQueryPath = getStaticQueryPath(hash)
  const absoluteStaticQueryPath = join(process.cwd(), `public`, staticQueryPath)
  const staticQueryRaw = await fs.readFile(absoluteStaticQueryPath)

  return JSON.parse(staticQueryRaw.toString())
}

export interface IResourcesForTemplate extends IScriptsAndStyles {
  staticQueryContext: Record<string, { data: unknown }>
}

const staticQueryResultCache = new Map<string, any>()
const inFlightStaticQueryPromise = new Map<string, Promise<any>>()

export function clearStaticQueryCaches(): void {
  staticQueryResultCache.clear()
  inFlightStaticQueryPromise.clear()
}

export const getStaticQueryContext = async (
  staticQueryHashes: IPageDataWithQueryResult["staticQueryHashes"]
): Promise<{
  staticQueryContext: IResourcesForTemplate["staticQueryContext"]
}> => {
  const staticQueryResultPromises: Array<Promise<void>> = []
  const staticQueryContext: IResourcesForTemplate["staticQueryContext"] = {}

  for (const staticQueryHash of staticQueryHashes) {
    const memoizedStaticQueryResult =
      staticQueryResultCache.get(staticQueryHash)
    if (memoizedStaticQueryResult) {
      staticQueryContext[staticQueryHash] = memoizedStaticQueryResult
      continue
    }

    let getStaticQueryPromise = inFlightStaticQueryPromise.get(staticQueryHash)
    if (!getStaticQueryPromise) {
      getStaticQueryPromise = getStaticQueryResult(staticQueryHash)
      inFlightStaticQueryPromise.set(staticQueryHash, getStaticQueryPromise)
      getStaticQueryPromise.then(() => {
        inFlightStaticQueryPromise.delete(staticQueryHash)
      })
    }

    staticQueryResultPromises.push(
      getStaticQueryPromise.then(results => {
        staticQueryContext[staticQueryHash] = results
      })
    )
  }

  await Promise.all(staticQueryResultPromises)

  return { staticQueryContext }
}
