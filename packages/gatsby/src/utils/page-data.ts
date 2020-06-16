import fs from "fs-extra"
import { ExecutionResult } from "graphql"
import path from "path"
import { IGatsbyPage } from "../redux/types"
import { store } from "../redux"

interface IPageData {
  componentChunkName: IGatsbyPage["componentChunkName"]
  matchPath?: IGatsbyPage["matchPath"]
  path: IGatsbyPage["path"]
}

interface IPageDataWithQueryResult extends IPageData {
  result: ExecutionResult
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

export async function readPageData(
  publicDir: string,
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  const filePath = getFilePath(publicDir, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawPageData)
}

export async function removePageData(
  publicDir: string,
  pagePath: string
): Promise<void> {
  const filePath = getFilePath(publicDir, pagePath)

  if (fs.existsSync(filePath)) {
    return await fs.remove(filePath)
  }

  return Promise.resolve()
}

export async function writePageData(
  publicDir: string,
  { componentChunkName, matchPath, path }: IPageData,
  result: IPageDataWithQueryResult["result"]
): Promise<void> {
  const filePath = getFilePath(publicDir, path)
  const body = {
    componentChunkName,
    path,
    matchPath,
    result,
  }
  const bodyStr = JSON.stringify(body)
  // transform asset size to kB (from bytes) to fit 64 bit to numbers
  const pageDataSize = Buffer.byteLength(bodyStr) / 1000

  store.dispatch({
    type: `ADD_PAGE_DATA_STATS`,
    payload: {
      filePath,
      size: pageDataSize,
    },
  })

  await fs.outputFile(filePath, bodyStr)
}
