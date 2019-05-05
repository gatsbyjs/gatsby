const fs = require(`fs-extra`)
const path = require(`path`)
const Promise = require(`bluebird`)
const Worker = require(`jest-worker`).default
const cpuCoreCount = require(`./cpu-core-count`)
const { chunk } = require(`lodash`)

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

const updateCompilationHashes = (
  { publicDir },
  pagePaths,
  webpackCompilationHash
) => {
  const workerPool = new Worker(require.resolve(`./page-data-worker`), {
    numWorkers: cpuCoreCount(true),
    forkOptions: {
      silent: false,
    },
  })
  const segments = chunk(pagePaths, 50)
  return Promise.map(segments, segment =>
    workerPool.updateCompilationHashes(
      { publicDir },
      segment,
      webpackCompilationHash
    )
  ).then(() => workerPool.end())
}

module.exports = {
  read,
  write,
  updateCompilationHashes,
}
