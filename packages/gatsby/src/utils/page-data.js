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

const writePageData = async ({ publicDir }, page, result) => {
  const filePath = getFilePath({ publicDir }, page.path)
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
      filePath,
      size: pageDataSize,
    },
  })

  await fs.outputFile(filePath, bodyStr)
}

const write = async ({ publicDir }, pagePath, data) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  console.log(filePath)

  // TODO: Gracefully check if the file exists or not
  // while we're pretty sure it does at the point in time where this fn is called

  const fileContents = await fs.readJSON(filePath)

  const body = {
    ...data,
    ...fileContents,
  }

  const bodyStr = JSON.stringify(body)

  await fs.outputFile(filePath, bodyStr)
}

module.exports = {
  read,
  write,
  writePageData,
  remove,
  fixedPagePath,
}
