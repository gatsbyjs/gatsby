const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const slash = require(`slash`)

// Implement the Gatsby API “onUpsertPage”. This is
// called after every page is created.
exports.onUpsertPage = ({ page, boundActionCreators }) => {
  const { upsertPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    // Make the front page match everything client side.
    // Normally your paths should be a bit more judicious.
    if (page.path === `/` && !page.matchPath) {
      page.matchPath = `/:path`
      upsertPage(page)
    }
    resolve()
  })
}
