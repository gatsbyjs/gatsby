const fs = require(`fs-extra`)
const path = require(`path`)
const Queue = require(`better-queue`)

const getFilePath = ({ publicDir }, pagePath) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}

const write = async ({ publicDir }, page, result, webpackCompilationHash) => {
  const filePath = getFilePath({ publicDir }, page.path)
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    compilationHash: webpackCompilationHash,
    ...result,
  }
  await fs.outputFile(filePath, JSON.stringify(body))
}

const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath)
  return JSON.parse(rawPageData)
}

const updateCompilationHash = async (
  { publicDir },
  pagePath,
  webpackCompilationHash
) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const pageData = await read({ publicDir }, pagePath)
  pageData.compilationHash = webpackCompilationHash
  await fs.outputFile(filePath, JSON.stringify(pageData))
}

// TODO We should move this to a worker model (like html page
// rendering) for performance
const rewriteCompilationHashes = (
  { publicDir },
  pagePaths,
  compilationHash
) => {
  if (pagePaths.length === 0) {
    return Promise.resolve()
  }
  const queueOptions = {
    concurrent: 4,
  }
  const handler = async (pagePath, callback) => {
    await updateCompilationHash({ publicDir }, pagePath, compilationHash)
    callback(null)
  }
  const q = new Queue(handler, queueOptions)
  const drainPromise = new Promise(resolve => {
    q.once(`drain`, () => resolve())
  })
  pagePaths.forEach(pagePath => q.push(pagePath))
  return drainPromise
}

module.exports = {
  write,
  read,
  updateCompilationHash,
  rewriteCompilationHashes,
}
