const { createPath, validatePath, ignorePath } = require(`gatsby-page-utils`)
const {
  createPagesFromCollectionBuilder,
} = require(`./create-pages-from-collection-builder`)
const systemPath = require(`path`)
const fs = require(`fs-extra`)

const pathIsCCollectionBuilder = path => {
  if (fs.existsSync(path) === false) return false
  const js = fs.readFileSync(path).toString()
  return js.includes(`createPagesFromData`)
}

exports.createPage = (filePath, pagesDirectory, actions, ignore, graphql) => {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(filePath)) {
    return
  }

  // Filter out anything matching the given ignore patterns and options
  if (ignorePath(filePath, ignore)) {
    return
  }

  const absolutePath = systemPath.join(pagesDirectory, filePath)

  if (pathIsCCollectionBuilder(absolutePath)) {
    createPagesFromCollectionBuilder(absolutePath, actions, graphql)
    return
  }

  // Create page object
  const createdPath = createPath(filePath)
  const page = {
    path: createdPath,
    component: absolutePath,
  }

  // Add page
  actions.createPage(page)
}
