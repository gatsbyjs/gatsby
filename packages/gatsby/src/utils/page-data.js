const fs = require(`fs-extra`)
const path = require(`path`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)

const { readFromCache } = require(`../redux/persist.js`)

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
    matchPath: page.matchPath,
    webpackCompilationHash,
    result,
  }
  await fs.outputFile(filePath, JSON.stringify(body))
}

const updateCompilationHashes = (
  { publicDir, workerPool },
  pagePaths,
  webpackCompilationHash
) => {
  const segments = _.chunk(pagePaths, 50)
  return Promise.map(segments, segment =>
    workerPool.updateCompilationHashes(
      { publicDir },
      segment,
      webpackCompilationHash
    )
  )
}

const stateToObject = state => {
  const newPageData = Object.assign({}, state)
  Object.keys(newPageData).forEach(key => {
    if (newPageData[key] instanceof Map) {
      const obj = {}
      newPageData[key].forEach((v, k) => {
        obj[k] = v
      })
      newPageData[key] = obj
    }
  })

  return newPageData
}

const getNewPageKeys = (store, incrementalBuild) =>
  new Promise(resolve => {
    if (!incrementalBuild) {
      resolve([...store.getState().pages.keys()])
      return
    }

    const newPageKeys = []
    const newPageData = stateToObject(store.getState())
    const previousPageData = stateToObject(readFromCache())

    _.forEach(newPageData.pages, (value, key) => {
      if (!(key in previousPageData.pages)) {
        newPageKeys.push(key)
      } else {
        const newPageContext = value.context.page
        const previousPageContext = previousPageData.pages[key].context.page

        if (!_.isEqual(newPageContext, previousPageContext)) {
          newPageKeys.push(key)
        }
      }
    })

    resolve(newPageKeys)
  })

const removeOldPageData = (directory, store) =>
  new Promise(resolve => {
    const newPageData = stateToObject(store.getState())
    const previousPageData = stateToObject(readFromCache())
    const deletedKeys = []

    _.forEach(previousPageData.pages, (value, key) => {
      if (!(key in newPageData.pages)) {
        deletedKeys.push(key)
        fs.removeSync(`${directory}/public${key}`)
        fs.removeSync(`${directory}/public/page-data${key}`)
      }
    })
    resolve(deletedKeys)
  })

module.exports = {
  read,
  write,
  updateCompilationHashes,
  getNewPageKeys,
  removeOldPageData,
}
