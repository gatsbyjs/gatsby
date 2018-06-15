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
const path = require(`path`)

const { store } = require(`../../redux/`)
const { boundActionCreators } = require(`../../redux/actions`)
const queryCompiler = require(`./query-compiler`).default
const queue = require(`./query-queue`)
const normalize = require(`normalize-path`)
const report = require(`gatsby-cli/lib/reporter`)

exports.extractQueries = () => {
  const state = store.getState()
  const pages = [...state.pages]
  const components = _.uniq(pages.map(p => normalize(p.component)))
  const staticQueryComponents = []
  const queryCompilerPromise = queryCompiler().then(queries => {
    let queryWillNotRun = false

    queries.forEach((query, component) => {
      if (_.includes(components, component)) {
        boundActionCreators.replaceComponentQuery({
          query: query && query.text,
          componentPath: component,
        })
        // Add action / reducer + watch staticquery files
      } else if (query.isStaticQuery) {
        staticQueryComponents.push(query.path)
        boundActionCreators.replaceStaticQuery({
          name: query.name,
          componentPath: query.path,
          id: query.jsonName,
          jsonName: query.jsonName,
          query: query.text,
          hash: query.hash,
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
        Queries are only executed for Page components. Instead of a query,
        co-locate a GraphQL fragment and compose that fragment into the query (or other
        fragment) of the top-level page that renders this component. For more
        info on fragments and composition see: http://graphql.org/learn/queries/#fragments
      `)
    }

    return
  })

  // During development start watching files to recompile & run
  // queries on the fly.
  if (process.env.NODE_ENV !== `production`) {
    watch(state.program.directory)

    // Ensure every component is being watched.
    components.forEach(component => {
      watcher.add(component)
    })
    staticQueryComponents.forEach(component => {
      watcher.add(component)
    })
  }

  return queryCompilerPromise
}

const runQueriesForPageComponent = componentPath => {
  const pages = getPagesForComponent(componentPath)
  // Remove page data dependencies before re-running queries because
  // the changing of the query could have changed the data dependencies.
  // Re-running the queries will add back data dependencies.
  boundActionCreators.deleteComponentsDependencies(
    pages.map(p => p.path || p.id)
  )
  pages.forEach(page =>
    queue.push({
      id: page.path,
      jsonName: page.jsonName,
      query: store.getState().components[componentPath].query,
      isPage: true,
      context: {
        ...page,
        ...page.context,
      },
    })
  )
}

const runQueriesForStaticComponent = ({
  query,
  hash,
  jsonName,
  componentPath,
}) => {
  queue.push({
    id: hash,
    jsonName,
    query,
    context: { path: jsonName },
  })
}

const getPagesForComponent = componentPath => {
  const state = store.getState()
  return [...state.pages].filter(p => p.componentPath === componentPath)
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
        runQueriesForPageComponent(componentPath)
      })

      // Update the store with the new queries and re-run queries that were
      // changed.
      queries.forEach(
        ({ text, path, name, hash, jsonName, isStaticQuery }, id) => {
          const componentPath = id
          if (isStaticQuery) {
            boundActionCreators.replaceStaticQuery({
              query: text,
              hash,
              id: jsonName,
              jsonName,
              componentPath: id,
            })
            runQueriesForStaticComponent({
              query: text,
              hash,
              jsonName,
              componentPath: id,
            })
          }
          // Queries can be parsed from non page components
          // e.g. components with fragments so ignore those.
          //
          // If the query has changed, set the new query in the
          // store and run its queries.
          if (components[id] && text !== components[id].query) {
            boundActionCreators.replaceComponentQuery({
              query: text,
              componentPath: id,
            })
            runQueriesForPageComponent(componentPath)
          }
        }
      )
    })
  }, 100)

  watcher = chokidar
    .watch(path.join(rootDir, `/src/**/*.{js,jsx,ts,tsx}`))
    .on(`change`, path => {
      debounceCompile()
    })
}
