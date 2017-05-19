const Promise = require(`bluebird`)

exports.onUpsertPage = ({ page, boundActionCreators }) => {
  const { upsertPage, deletePageByPath } = boundActionCreators

  return new Promise((resolve, reject) => {
    // Remove trailing slash
    const oldPath = page.path
    page.path = page.path === `/` ? page.path : page.path.replace(/\/$/, ``)
    if (page.path !== oldPath) {
      // Remove the old page
      deletePageByPath(oldPath)

      // Add the new page
      upsertPage(page)
    }

    resolve()
  })
}
