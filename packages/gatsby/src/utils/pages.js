const glob = require(`glob`)
const del = require(`del`)

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
 * Finds a list of unused page html files that are leftover from deleted pages
 *
 * @argument {object}
 * {object} availablePagePaths: an array of paths to pages
 * {object} directory: the root of the Gatsby site
 * @returns {array}
 */
const getUnusedPageHtmlPaths = ({ availablePagePaths, directory }) => {
  const allPageHtmlFiles = glob.sync(`./public/**/*.html`, {
    cwd: directory,
  })

  const unusedPageDataFiles = allPageHtmlFiles.filter(pageHtmlPath => {
    const normalizedPageHtmlPath = pageHtmlPath
      .replace(`./public/`, `/`)
      .replace(`/index.html`, `/`)

    return !availablePagePaths.find(
      pagePath => pagePath === normalizedPageHtmlPath
    )
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
const deleteUnusedPages = ({ store, directory }) => {
  const availablePagePaths = Array.from(store.getState().pages.keys())

  const unusedPageData = getUnusedPageDataPaths({
    availablePagePaths,
    directory,
  })

  const unusedPageHtmlPaths = getUnusedPageHtmlPaths({
    availablePagePaths,
    directory,
  })

  return unusedPageData.length
    ? del([...unusedPageData, ...unusedPageHtmlPaths])
    : false
}

module.exports = {
  deleteUnusedPages,
  getUnusedPageDataPaths,
}
