const _ = require(`lodash`)
const Promise = require(`bluebird`)

// Replacing '/' would result in empty string which is invalid
const replacePath = path => (path === `/`) ? path : path.replace(/\/$/, ``)

exports.onUpsertPage = ({ page, boundActionCreators }) => {
  const { upsertPage, deletePageByPath } = boundActionCreators

  return new Promise((resolve, reject) => {
    // Remove trailing slash
    const oldPath = page.path
    page.path = replacePath(page.path)
    if (page.path !== oldPath) {

      // Remove the old page
      deletePageByPath(oldPath)

      // Add the new page
      upsertPage(page)
    }

    resolve()
  })
}
