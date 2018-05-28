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
const queue = require(`./query-queue`)
const normalize = require(`normalize-path`)
const report = require(`gatsby-cli/lib/reporter`)

exports.extractQueries = () => {
  const state = store.getState()
  const pagesAndLayouts = [...state.pages, ...state.layouts]
  const components = _.uniq(pagesAndLayouts.map(p => normalize(p.component)))
  const queryCompilerPromise = queryCompiler().then(queries => {
    let queryWillNotRun = false

    queries.forEach((query, component) => {
      if (_.includes(components, component)) {
        boundActionCreators.replaceComponentQuery({
          query: query && query.text,
          componentPath: component,
        })
      } else {
        report.warn(
          `The GraphQL query in the non-page component "${component}" will not be run.`
        )
        queryWillNotRun = true
      }
    })

    if (queryWillNotRun) {
      report.log(report.stripIndent`
        Queries are only executed for Page or Layout components. Instead of a query,
        co-locate a GraphQL fragment and compose that fragment into the query (or other
        fragment) of the top-level page or layout that renders this component. For more
        info on fragments and composition see: http://graphql.org/learn/queries/#fragments
      `)
    }

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

  return queryCompilerPromise
}

const runQueriesForComponent = componentPath => {
  const pages = getPagesForComponent(componentPath)
  // Remove page & layout data dependencies before re-running queries because
  // the changing of the query could have changed the data dependencies.
  // Re-running the queries will add back data dependencies.
  boundActionCreators.deleteComponentsDependencies(
    pages.map(p => p.path || p.id)
  )
  pages.forEach(page =>
    queue.push({ ...page, _id: page.id, id: page.jsonName })
  )

  return new Promise(resolve => {
    queue.on(`drain`, () => resolve())
  })
}

const getPagesForComponent = componentPath => {
  const state = store.getState()
  return [...state.pages, ...state.layouts].filter(
    p => p.componentPath === componentPath
  )
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

      // If a component previously with a query now doesn't — update the
      // store.
      const noQueryComponents = Object.values(components).filter(
        c => c.query !== `` && !queries.has(c.componentPath)
      )
      noQueryComponents.forEach(({ componentPath }) => {
        boundActionCreators.replaceComponentQuery({
          query: ``,
          componentPath,
        })
        runQueriesForComponent(componentPath)
      })

      // Update the store with the new queries and re-run queries that were
      // changed.
      queries.forEach(({ text }, id) => {
        // Queries can be parsed from non page/layout components
        // e.g. components with fragments so ignore those.
        //
        // If the query has changed, set the new query in the
        // store and run its queries.
        if (components[id] && text !== components[id].query) {
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
