import fs from "fs-extra"
import path from "path"
import { IGatsbyPage } from "../redux/types"
import { store } from "../redux"

interface IPageDataContext {
  publicDir: string
}

interface IPageData
  extends Pick<IGatsbyPage, "componentChunkName" | "matchPath" | "path"> {
  result: any
}

export const fixedPagePath = (pagePath: string): string =>
  pagePath === `/` ? `index` : pagePath

const getFilePath = (
  { publicDir }: IPageDataContext,
  pagePath: string
): string =>
  path.join(publicDir, `page-data`, fixedPagePath(pagePath), `page-data.json`)

export const read = async (
  { publicDir }: IPageDataContext,
  pagePath: string
): Promise<IPageData> => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawPageData)
}

export const remove = async (
  { publicDir }: IPageDataContext,
  pagePath: string
): Promise<void> => {
  const filePath = getFilePath({ publicDir }, pagePath)

  if (fs.existsSync(filePath)) {
    return await fs.remove(filePath)
  }

  return Promise.resolve()
}

export const write = async (
  { publicDir }: IPageDataContext,
  { componentChunkName, matchPath, path }: Exclude<IPageData, "result">,
  result: IPageData["result"]
): Promise<void> => {
  const filePath = getFilePath({ publicDir }, path)
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

export default {
  fixedPagePath,
  read,
  remove,
  write,
}
