const Promise = require(`bluebird`)

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  // Remove trailing slash
  const newPage = Object.assign({}, page, {
    path: page.path === `/` ? page.path : page.path.replace(/\/$/, ``),
  })
  if (newPage.path !== page.path) {
    // Remove the old page
    deletePage(page)
    // Add the new page
    return createPage(newPage)
  }
  return Promise.resolve()
}
