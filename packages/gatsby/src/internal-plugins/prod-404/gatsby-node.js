let created404 = false
exports.onCreatePage = ({ page, store, boundActionCreators }) => {
  // Copy /404/ to /404.html as many static site hosts expect
  // site 404 pages to be named this.
  // https://www.gatsbyjs.org/docs/add-404-page/
  if (!created404 && page.path === `/404/`) {
    boundActionCreators.createPage({
      ...page,
      path: `/404.html`,
    })
    created404 = true
  }
}
