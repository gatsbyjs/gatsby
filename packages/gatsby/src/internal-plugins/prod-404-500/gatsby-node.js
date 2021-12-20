const { emitter, store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)

const originalStatusPageByStatus = {}
const originalStatusPageByPath = {}

emitter.on(`CREATE_PAGE`, action => {
  // Copy /404/ to /404.html and /500/ to /500.html. Many static site hosts expect
  // site 404 pages to be named this. In addition, with Rendering Engines there might
  // be runtime errors which would fallback to "/500.html" page.
  // https://www.gatsbyjs.org/docs/how-to/adding-common-features/add-404-page/
  const result = /^\/?(404|500)\/?$/.exec(action.payload.path)
  if (result && result.length > 1) {
    const status = result[1]

    const originalPage = originalStatusPageByStatus[status]

    if (!originalPage) {
      const storedPage = {
        path: action.payload.path,
        component: action.payload.component,
        context: action.payload.context,
        status,
      }

      originalStatusPageByStatus[status] = storedPage
      originalStatusPageByPath[action.payload.path] = storedPage

      store.dispatch(
        actions.createPage(
          {
            ...storedPage,
            path: `/${status}.html`,
          },
          action.plugin,
          action
        )
      )
    }
  }
})

emitter.on(`DELETE_PAGE`, action => {
  const storedPage = originalStatusPageByPath[action.payload.path]
  if (storedPage) {
    store.dispatch(
      actions.deletePage({
        ...storedPage,
        path: `/${storedPage.status}.html`,
      })
    )
    originalStatusPageByPath[action.payload.path] = null
    originalStatusPageByStatus[storedPage.status] = null
  }
})
