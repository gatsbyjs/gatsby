const { emitter, store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)

const PROD_404_PAGE_PATH = `/404.html`

let page404 = null
emitter.on(`CREATE_PAGE`, action => {
  // Copy /404/ to /404.html as many static site hosts expect
  // site 404 pages to be named this.
  // https://www.gatsbyjs.org/docs/how-to/adding-common-features/add-404-page/
  if (!page404 && /^\/?404\/?$/.test(action.payload.path)) {
    console.log(`found 404`, action)
    store.dispatch(
      actions.createPage(
        {
          path: PROD_404_PAGE_PATH,
          component: action.payload.component,
          context: action.payload.context,
        },
        action.plugin
      )
    )
    page404 = true
  }
})

emitter.on(`DELETE_PAGE`, action => {
  if (page404 && action.payload.path === page404.path) {
    store.dispatch(
      actions.deletePage({
        ...page404,
        path: PROD_404_PAGE_PATH,
      })
    )
    page404 = null
  }
})
