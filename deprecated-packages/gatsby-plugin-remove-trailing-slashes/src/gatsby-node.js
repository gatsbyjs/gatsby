// Replacing '/' would result in empty string which is invalid
const replacePath = _path => (_path === `/` ? _path : _path.replace(/\/$/, ``))

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  return new Promise(resolve => {
    const oldPage = Object.assign({}, page)
    page.path = replacePath(page.path)
    if (page.path !== oldPage.path) {
      deletePage(oldPage)
      createPage(page)
    }
    resolve()
  })
}

exports.onPreInit = ({ reporter }) => {
  reporter.warn(
    `gatsby-plugin-remove-trailing-slashes: Gatsby now has a trailingSlash option. Learn more at https://gatsby.dev/trailing-slash`
  )
}
