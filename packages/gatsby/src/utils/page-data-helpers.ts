import type { IStructuredError } from "gatsby-cli/src/structured-errors/types"
import { IGatsbyPage } from "../redux/types"

export interface IPageData {
  componentChunkName: IGatsbyPage["componentChunkName"]
  matchPath?: IGatsbyPage["matchPath"]
  path: IGatsbyPage["path"]
  staticQueryHashes: Array<string>
  getServerDataError?: IStructuredError | Array<IStructuredError> | null
  manifestId?: string
}

export function constructPageDataString(
  {
    componentChunkName,
    matchPath,
    path: pagePath,
    staticQueryHashes,
    manifestId,
  }: IPageData,
  result: string | Buffer
): string {
  let body = `{
    "componentChunkName": "${componentChunkName}",
    "path": ${JSON.stringify(pagePath)},
    "result": ${result},
    "staticQueryHashes": ${JSON.stringify(staticQueryHashes)}`

  if (matchPath) {
    body += `,
    "matchPath": "${matchPath}"`
  }

  if (manifestId) {
    body += `,
    "manifestId": "${manifestId}"`
  }

  body += `}`

  return body
}

export function reverseFixedPagePath(pageDataRequestPath: string): string {
  return pageDataRequestPath === `index` ? `/` : pageDataRequestPath
}

export function getPagePathFromPageDataPath(
  pageDataPath: string
): string | null {
  const matches = pageDataPath.matchAll(
    /^\/?page-data\/(.+)\/page-data.json$/gm
  )
  for (const [, requestedPagePath] of matches) {
    return reverseFixedPagePath(requestedPagePath)
  }

  return null
}
