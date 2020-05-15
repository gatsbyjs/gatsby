const { createPath, validatePath, ignorePath } = require(`gatsby-page-utils`)
const { createClientOnlyPage } = require(`./create-client-only-page`)
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

const pathIsClientOnlyRoute = path => /\[.*\]/.test(path)

exports.createPage = (filePath, pagesDirectory, actions, ignore, graphql) => {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(filePath)) {
    console.log(1, filePath)
    return
  }

  // Filter out anything matching the given ignore patterns and options
  if (ignorePath(filePath, ignore)) {
    console.log(2, filePath)
    return
  }

  const absolutePath = systemPath.join(pagesDirectory, filePath)

  if (pathIsCCollectionBuilder(absolutePath)) {
    console.log(3, absolutePath)
    createPagesFromCollectionBuilder(absolutePath, actions, graphql)
    return
  }

  if (pathIsClientOnlyRoute(absolutePath)) {
    console.log(4, absolutePath)
    createClientOnlyPage(absolutePath, actions)
    return
  }

  console.log(5, filePath)

  // Create page object
  const createdPath = createPath(filePath)
  const page = {
    path: createdPath,
    component: absolutePath,
  }

  // Add page
  actions.createPage(page)
}
