const Promise = require(`bluebird`)

exports.onCreatePage = ({ page, boundActionCreators }) => {
  const { createPage, deletePage } = boundActionCreators

  return new Promise((resolve, reject) => {
    // Remove trailing slash
    const oldPath = page.path
    page.path = page.path === `/` ? page.path : page.path.replace(/\/$/, ``)
    if (page.path !== oldPath) {
      // Remove the old page
      deletePage({ path: oldPath })

      // Add the new page
      createPage(page)
    }

    resolve()
  })
}
