exports.onCreatePage = ({ page, actions }) => {
  if (page.path === `/client-only-paths/`) {
    // create client-only-paths
    page.matchPath = `/client-only-paths/*`
    actions.createPage(page)
  } else if (page.path === `/`) {
    // use index page as template
    // (mimics)
    actions.createPage({
      ...page,
      path: `/duplicated`,
      context: {
        DOMMarker: `duplicated`,
      },
    })
  }
}
