exports.onCreatePage = ({ page, actions }) => {
  switch (page.path) {
    case `/client-only-paths/`:
      // create client-only-paths
      page.matchPath = `/client-only-paths/*`
      actions.createPage(page)
      break

    case `/path-context/`:
      actions.createPage({
        ...page,
        context: {
          foo: `bar`,
        },
      })
      break

    case `/`:
      // use index page as template
      // (mimics)
      actions.createPage({
        ...page,
        path: `/duplicated`,
        context: {
          DOMMarker: `duplicated`,
        },
      })
      break
  }
}
