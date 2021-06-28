// Replacing '/' would result in empty string which is invalid
const replacePath = _path => (_path === `/` ? _path : _path.replace(/\/$/, ``))

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage, deletePage } = actions

  const oldPage = Object.assign({}, page)
  page.path = replacePath(page.path)
  if (page.path !== oldPage.path) {
    await deletePage(oldPage)
    await createPage(page)
  }
}
