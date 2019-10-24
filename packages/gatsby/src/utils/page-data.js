const fs = require(`fs-extra`)
const path = require(`path`)
const glob = require(`glob`)
const del = require(`del`)

const getFilePath = ({ publicDir }, pagePath) => {
  const fixedPagePath = pagePath === `/` ? `index` : pagePath
  return path.join(publicDir, `page-data`, fixedPagePath, `page-data.json`)
}

const read = async ({ publicDir }, pagePath) => {
  const filePath = getFilePath({ publicDir }, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)
  return JSON.parse(rawPageData)
}

const write = async ({ publicDir }, page, result) => {
  const filePath = getFilePath({ publicDir }, page.path)
  const body = {
    componentChunkName: page.componentChunkName,
    path: page.path,
    matchPath: page.matchPath,
    result,
  }
  await fs.outputFile(filePath, JSON.stringify(body))
}

/**
 * Returns the corresponding html file path for a page-data.json file
 */
const getPageDataHtmlPath = pageDataPath =>
  pageDataPath
    .replace(`/index/`, `/`)
    .replace(`./public/page-data/`, `/`)
    .replace(`/page-data.json`, ``)

/**
 * Finds a list of unused page-data.json files that are leftover from deleted pages
 *
 * @argument {object}
 * {object} availablePagePaths: an array of paths to pages
 * {object} directory: the root of the Gatsby site
 * @returns {array}
 */
const getUnusedPageDataPaths = ({ availablePagePaths, directory }) => {
  const allPageDataFiles = glob.sync(`./public/page-data/**/page-data.json`, {
    cwd: directory,
  })

  const unusedPageDataFiles = allPageDataFiles.filter(pageDataPath => {
    // string replaces allow us to match page-data paths against public html paths
    const normalizedPageDataPath = getPageDataHtmlPath(pageDataPath)

    // if this page-data.json file doesn't have a matching html file,
    // it's not being used
    const thisPageDataIsUnused =
      !availablePagePaths.includes(normalizedPageDataPath) &&
      !availablePagePaths.includes(`${normalizedPageDataPath}/`)

    return thisPageDataIsUnused
  })

  return unusedPageDataFiles
}

/**
 * On each build all html is rebuilt - so there is no need to
 * individually determine which html files to delete.
 * Corresponding page-data.json files aren't also deleted on rebuilds,
 * so we need to check available page-data.json files against
 * available html pages and then delete any page-data.json
 * that is no longer being used so that 404 pages don't load page-data.
 *
 * @argument {object}
 * {object} store: Gatsby's redux store
 * {object} directory: the root of the Gatsby site
 * @returns {promise|false}
 */
const deleteUnusedPageData = ({ store, directory }) => {
  const availablePagePaths = Array.from(store.getState().pages.keys())

  const unusedPageData = getUnusedPageDataPaths({
    availablePagePaths,
    directory,
  })

  return unusedPageData.length ? del(unusedPageData) : false
}

module.exports = {
  read,
  write,
  deleteUnusedPageData,
  getUnusedPageDataPaths,
}
