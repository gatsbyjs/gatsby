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

const { store } = require(`../../redux/`)
const { boundActionCreators } = require(`../../redux/actions`)
const queryCompiler = require(`./query-compiler`).default
const queryRunner = require(`./query-runner`)
const invariant = require(`invariant`)
const normalize = require(`normalize-path`)

exports.extractQueries = () => {
  const state = store.getState()
  const pages = [
    ...state.pages,
    ...state.layouts
  ]
  const components = _.uniq(pages.map(p => p.component))
  queryCompiler().then(queries => {
    components.forEach(component => {
      const query = queries.get(normalize(component))

      // console.log(query)

      boundActionCreators.replacePageComponentQuery({
        query: query && query.text,
        componentPath: component,
      })
    })

    return
  })

  // During development start watching files to recompile & run
  // queries on the fly.
  if (process.env.NODE_ENV !== `production`) {
    watch()

    // Ensure every component is being watched.
    components.forEach(component => {
      watcher.add(component)
    })
  }
}

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
exports.watchComponent = componentPath => {
  // We don't start watching until mid-way through the bootstrap so ignore
  // new components being added until then. This doesn't affect anything as
  // when extractQueries is called from bootstrap, we make sure that all
  // components are being watched.
  if (watcher) {
    watcher.add(componentPath)
  }
}
const watch = rootDir => {
  if (watcher) return

  const debounceCompile = _.debounce(() => {
    queryCompiler().then(queries => {
      const pages = store.getState().pageComponents
      queries.forEach(({ text }, path) => {
        invariant(
          pages[path],
          `Path ${path} not found in the store pages: ${JSON.stringify(pages)}`
        )

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
    .watch(`${rootDir}/src/**/*.{js,jsx,ts,tsx}`)
    .on(`change`, path => {
      debounceCompile()
    })
}
