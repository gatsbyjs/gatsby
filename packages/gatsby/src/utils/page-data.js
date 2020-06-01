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

const write = async ({ publicDir }, page, { staticQueryHashes }) => {
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
    staticQueryHashes,
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
}

const flush = async () => {
  const {
    pendingPageDataWrites,
    components,
    pages,
    staticQueriesByTemplate,
    program,
  } = store.getState()

  console.log({
    staticQueriesByTemplate,
  })

  const { pagePaths, templatePaths } = pendingPageDataWrites

  const pagesToWrite = Array.from(templatePaths).reduce(
    (set, componentPath) => {
      const { pages } = components.get(componentPath)
      pages.forEach(set.add.bind(set))
      return set
    },
    new Set(pagePaths.values())
  )

  for (const pagePath of pagesToWrite) {
    const page = pages.get(pagePath)
    const staticQueryHashes = staticQueriesByTemplate
      .get(page.componentPath)
      .map(String)
    const body = await write(
      { publicDir: path.join(program.directory, `public`) },
      page,
      {
        staticQueryHashes,
      }
    )

    if (program.command === `develop`) {
      websocketManager.emitPageData({
        ...body.result,
        id: pagePath,
        result: {
          data: body.result.data,
          pageContext: body.result.pageContext,
          moduleDependencies: body.moduleDependencies,
          staticQueryHashes: body.staticQueryHashes,
        },
      })
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
