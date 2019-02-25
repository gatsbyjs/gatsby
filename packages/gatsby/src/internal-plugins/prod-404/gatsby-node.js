let created404 = false
exports.onCreatePage = ({ page, store, actions }) => {
  // Copy /404/ to /404.html as many static site hosts expect
  // site 404 pages to be named this.
  // https://www.gatsbyjs.org/docs/add-404-page/
  if (!created404 && page.path === `/404/`) {
    created404 = true
    return actions.createPage({
      ...page,
      path: `/404.html`,
    })
  }
  return Promise.resolve()
}
