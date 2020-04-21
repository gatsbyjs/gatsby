const { createPath, validatePath, ignorePath } = require(`gatsby-page-utils`)

exports.createPage = (filePath, pagesDirectory, createPage, ignore) => {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(filePath)) {
    return
  }

  // Filter out anything matching the given ignore patterns and options
  if (ignorePath(filePath, ignore)) {
    return
  }

  // Create page object
  const createdPath = createPath(filePath)
  const page = {
    path: createdPath,
    component: systemPath.join(pagesDirectory, filePath),
  }

  // Add page
  createPage(page)
}
