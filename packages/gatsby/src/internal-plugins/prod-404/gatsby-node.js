const { emitter } = require(`../../redux`)
const { boundActionCreators } = require(`../../redux/actions`)

const PROD_404_PAGE_PATH = `/404.html`

let page404 = null
const fourOhFourRegex = /^\/?404\/?$/
emitter.on(`CREATE_PAGE`, action => {
  // Copy /404/ to /404.html as many static site hosts expect
  // site 404 pages to be named this.
  // https://www.gatsbyjs.org/docs/how-to/adding-common-features/add-404-page/
  if (!page404 && fourOhFourRegex.test(action.payload.path)) {
    boundActionCreators.createPage(
      {
        ...action.payload,
        path: PROD_404_PAGE_PATH,
      },
      { name: `prod-404`, id: `prod-404` }
    )
    page404 = action.payload
  }
})

emitter.on(`DELETE_PAGE`, action => {
  if (page404 && action.payload.path === page404.path) {
    boundActionCreators.deletePage({
      ...page404,
      path: PROD_404_PAGE_PATH,
    })
    page404 = null
  }
})
