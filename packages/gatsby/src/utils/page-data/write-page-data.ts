import * as path from "path"
import * as fs from "fs-extra"

import type { IExecutionResult } from "../../query/types"
import type { IGatsbyPage } from "../../redux/types"

export interface IPageDataWithQueryResult extends IPageData {
  result: IExecutionResult
}

interface IPageData {
  componentChunkName: IGatsbyPage["componentChunkName"]
  matchPath?: IGatsbyPage["matchPath"]
  path: IGatsbyPage["path"]
  staticQueryHashes: Array<string>
}

export function fixedPagePath(pagePath: string): string {
  return pagePath === `/` ? `index` : pagePath
}

export function getFilePath(publicDir: string, pagePath: string): string {
  return path.join(
    publicDir,
    `page-data`,
    fixedPagePath(pagePath),
    `page-data.json`
  )
}

export async function writePageData(
  publicDir: string,
  {
    componentChunkName,
    matchPath,
    path: pagePath,
    staticQueryHashes,
  }: IPageData,
  pageQueryResult: string | Buffer
): Promise<{
  body: string
  outputFilePath: string
  pageDataSize: number
}> {
  const outputFilePath = getFilePath(publicDir, pagePath)
  let body = `{
    "componentChunkName": "${componentChunkName}",
    "path": "${pagePath}",
    "result": ${pageQueryResult},
    "staticQueryHashes": ${JSON.stringify(staticQueryHashes)}`

  if (matchPath) {
    body += `,
    "matchPath": "${matchPath}"`
  }

  body += `}`

  // transform asset size to kB (from bytes) to fit 64 bit to numbers
  const pageDataSize = Buffer.byteLength(body) / 1000

  await fs.outputFile(outputFilePath, body)
  return { body, outputFilePath, pageDataSize }
}
