const fs = require(`fs-extra`)
const path = require(`path`)
const Queue = require(`better-queue`)

const getFilePath = ({ publicDir }, pagePath) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}

const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const write = async ({ publicDir }, page, result, webpackCompilationHash) => {
  const filePath = getFilePath({ publicDir }, page.path)
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    webpackCompilationHash,
    result,
  }
  await fs.outputFile(filePath, JSON.stringify(body))
}

const updateCompilationHash = async (
  { publicDir },
  pagePath,
  webpackCompilationHash
) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const pageData = await read({ publicDir }, pagePath)
  pageData.webpackCompilationHash = webpackCompilationHash
  await fs.outputFile(filePath, JSON.stringify(pageData))
}

// TODO We can probably use jest-worker to to split this work across
// multiple cores (like html rendering)
const updateCompilationHashes = (
  { publicDir },
  pagePaths,
  webpackCompilationHash
) => {
  if (pagePaths.length === 0) {
    return Promise.resolve()
  }
  const handler = (pagePath, callback) =>
    updateCompilationHash({ publicDir }, pagePath, webpackCompilationHash).then(
      () => callback(null)
    )
  const q = new Queue(handler, { concurrent: 4 })
  const drainPromise = new Promise(resolve => {
    q.once(`drain`, () => resolve())
  })
  pagePaths.forEach(pagePath => q.push(pagePath))
  return drainPromise
}

module.exports = {
  read,
  write,
  updateCompilationHashes,
}
