import { websocketManager } from "./websocket-manager"
const fs = require(`fs-extra`)
const path = require(`path`)
const { store } = require(`../redux`)

const fixedPagePath = pagePath => (pagePath === `/` ? `index` : pagePath)

const getFilePath = ({ publicDir }, pagePath) =>
  path.join(publicDir, `page-data`, fixedPagePath(pagePath), `page-data.json`)

const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const remove = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  if (fs.existsSync(filePath)) {
    return await fs.remove(filePath)
  }
  return Promise.resolve()
}

const write = async ({ publicDir }, page) => {
  const inputFilePath = path.join(
    publicDir,
    `..`,
    `.cache`,
    `json`,
    `${page.path.replace(/\//g, `_`)}.json`
  )
  const outputFilePath = getFilePath({ publicDir }, page.path)
  const result = await fs.readJSON(inputFilePath)
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    matchPath: page.matchPath,
    result,
  }
  const bodyStr = JSON.stringify(body)
  // transform asset size to kB (from bytes) to fit 64 bit to numbers
  const pageDataSize = Buffer.byteLength(bodyStr) / 1000

  store.dispatch({
    type: `ADD_PAGE_DATA_STATS`,
    payload: {
      filePath: outputFilePath,
      size: pageDataSize,
    },
  })

  await fs.outputFile(outputFilePath, bodyStr)
  return body
}

const flush = async () => {
  const { pendingPageDataWrites, components, pages, program } = store.getState()

  const { pagePaths, templatePaths } = pendingPageDataWrites

  const pagesToWrite = Array.from(templatePaths).reduce(
    (set, componentPath) => {
      const { pages } = components.get(componentPath)
      if (pages) {
        pages.forEach(set.add.bind(set))
      }
      return set
    },
    new Set(pagePaths.values())
  )

  for (const pagePath of pagesToWrite) {
    const page = pages.get(pagePath)

    // It's a gloomy day in Bombay, let me tell you a short story...
    // Once upon a time, writing page-data.json files were atomic
    // After this change (#24808), they are not and this means that
    // between adding a pending write for a page and actually flushing
    // them, a page might not exist anymore щ（ﾟДﾟщ）
    // This is why we need this check
    if (page) {
      const body = await write(
        { publicDir: path.join(program.directory, `public`) },
        page
      )

      if (program?._?.[0] === `develop`) {
        websocketManager.emitPageData({
          ...body.result,
          id: pagePath,
          result: {
            data: body.result.data,
            pageContext: body.result.pageContext,
          },
        })
      }
    }
  }

  store.dispatch({
    type: `CLEAR_PENDING_PAGE_DATA_WRITES`,
  })

  return
}

module.exports = {
  read,
  write,
  remove,
  fixedPagePath,
  flush,
  getFilePath,
}
