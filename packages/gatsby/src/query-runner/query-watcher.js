/** *
 * Jobs of this module
 * - Maintain the list of components in the Redux store. So monitor new pages
 *   and add/remove components.
 * - Watch components for query changes and extract these and update the store.
 * - Ensure all page queries are run as part of bootstrap and report back when
 *   this is done
 * - Whenever a query changes, re-run all pages that rely on this query.
 ***/

const _ = require(`lodash`)
const chokidar = require(`chokidar`)
const fs = require(`fs`)
const path = require(`path`)

const { store, emitter } = require(`../redux/`)
const { boundActionCreators } = require(`../redux/actions`)
const queryCompiler = require(`./query-compiler`).default
const queryRunner = require(`./query-runner`)

const pageComponents = {}
let pendingPages = []

const debounceNewPages = _.debounce(() => {
  let pages = pendingPages
  pendingPages = []

  queryCompiler().then(queries => {
    pages.forEach(componentPath => {
      const query = queries.get(componentPath)

      boundActionCreators.replacePageComponentQuery({
        query: query && query.text,
        componentPath,
      })
    })

    store.dispatch({
      type: `BOOTSTRAP_STAGE`,
      payload: {
        stage: `COMPONENT_QUERIES_EXTRACTION_FINISHED`,
      },
    })
  })
}, 300)

// Watch for page updates.
emitter.on(`CREATE_PAGE`, action => {
  const component = action.payload.component
  if (!pageComponents[component]) {
    // We haven't seen this component before so we:
    // - Ensure it has a JSON file.
    // - Add it to Redux
    // - Extract its query and save it
    // - Setup a watcher to detect query changes
    const pathToJSONFile = path.join(
      store.getState().program.directory,
      `.cache`,
      `json`,
      action.payload.jsonName
    )
    if (!fs.existsSync(pathToJSONFile)) {
      fs.writeFile(pathToJSONFile, `{}`)
    }
    boundActionCreators.createPageComponent(component)
    pendingPages.push(component)
    // Make sure we're watching this component.
    watcher.add(component)
    debounceNewPages()
  }

  // Mark we've seen this page component.
  pageComponents[component] = component
})

const runQueriesForComponent = componentPath => {
  const pages = getPagesForComponent(componentPath)
  // Remove page data dependencies before re-running queries because
  // the changing of the query could have changed the data dependencies.
  // Re-running the queries will add back data dependencies.
  boundActionCreators.deletePagesDependencies(pages.map(p => p.path))
  const component = store.getState().pageComponents[componentPath]
  return Promise.all(pages.map(p => queryRunner(p, component)))
}

const getPagesForComponent = componentPath =>
  store.getState().pages.filter(p => p.component === componentPath)

let watcher
exports.watch = rootDir => {
  if (watcher) return

  const debounceCompile = _.debounce(() => {
    queryCompiler().then(queries => {
      const pages = store.getState().pageComponents
      queries.forEach(({ text }, path) => {
        if (text !== pages[path].query) {
          boundActionCreators.replacePageComponentQuery({
            query: text,
            componentPath: path,
          })
          runQueriesForComponent(path)
        }
      })
    })
  }, 100)

  watcher = chokidar
    .watch(`${rootDir}/src/**/*.{js,jsx}`)
    .on(`change`, path => {
      debounceCompile()
    })
}
