/** *
 * Jobs of this module
 * - Maintain the list of components in the Redux store. So monitor new components
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
  // TODO We can just grab the components straight from store here?
  const state = store.getState()
  const pagesAndLayouts = [
    ...state.pages,
    ...state.layouts
  ]
  const components = _.uniq(pagesAndLayouts.map(p => p.component))
  queryCompiler().then(queries => {
    components.forEach(component => {
      const query = queries.get(normalize(component))
      boundActionCreators.replaceComponentQuery({
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
  // console({pages})
  // Remove page & layout data dependencies before re-running queries because
  // the changing of the query could have changed the data dependencies.
  // Re-running the queries will add back data dependencies.
  boundActionCreators.deleteComponentsDependencies(pages.map(p => p.path || p.id))
  const component = store.getState().components[componentPath]
  return Promise.all(pages.map(p => queryRunner(p, component)))
}

const getPagesForComponent = componentPath => {
  const state = store.getState()
  return [
    ...state.pages,
    ...state.layouts
  ].filter(p => p.componentPath === componentPath)
}

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
      const components = store.getState().components
      queries.forEach(({ text }, id) => {
        invariant(
          components[id],
          `${id} not found in the store components: ${JSON.stringify(components)}`
        )

        if (text !== components[id].query) {
          console.log(id, text)
          boundActionCreators.replaceComponentQuery({
            query: text,
            componentPath: id,
          })
          runQueriesForComponent(id)
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
