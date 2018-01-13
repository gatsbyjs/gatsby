const Promise = require(`bluebird`)
const path = require(`path`)

// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = ({ page, actions }) => {
  const { createPage } = actions
  return new Promise((resolve, reject) => {
    // Make the front page match everything client side.
    // Normally your paths should be a bit more judicious.
    if (page.path === `/`) {
      page.matchPath = `/:path`
      createPage(page)
    }
    resolve()
  })
}
