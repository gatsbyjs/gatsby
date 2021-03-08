const { emitter, store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)

const PROD_404_PAGE_PATH = `/404.html`

let page404 = null
exports.onCreatePage = ({ page, store, actions }) => {
  // Copy /404/ to /404.html as many static site hosts expect
  // site 404 pages to be named this.
  // https://www.gatsbyjs.org/docs/how-to/adding-common-features/add-404-page/
  if (!page404 && /^\/?404\/?$/.test(page.path)) {
    actions.createPage({
      ...page,
      path: PROD_404_PAGE_PATH,
    })
    page404 = page
  }
}

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
