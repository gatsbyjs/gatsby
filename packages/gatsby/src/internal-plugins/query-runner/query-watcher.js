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
const slash = require(`slash`)

const { store } = require(`../../redux/`)
const { boundActionCreators } = require(`../../redux/actions`)
const queryCompiler = require(`./query-compiler`).default
const report = require(`gatsby-cli/lib/reporter`)
const {
  queueQueryForPathname,
  runQueuedActions: runQueuedQueries,
} = require(`./page-query-runner`)
const debug = require(`debug`)(`gatsby:query-watcher`)

const getQueriesSnapshot = () => {
  const state = store.getState()

  const snapshot = {
    components: new Map(state.components),
    staticQueryComponents: new Map(state.staticQueryComponents),
  }

  return snapshot
}

const handleComponentsWithRemovedQueries = (
  { components, staticQueryComponents },
  queries
) => {
  // If a component previously with a query now doesn't — update the
  // store.
  components.forEach(c => {
    if (c.query !== `` && !queries.has(c.componentPath)) {
      debug(`Page query was removed from ${c.componentPath}`)
      boundActionCreators.replaceComponentQuery({
        query: ``,
        componentPath: c.componentPath,
      })
      queueQueriesForPageComponent(c.componentPath)
    }
  })

  // If a component had static query and it doesn't have it
  // anymore - update the store
  staticQueryComponents.forEach(c => {
    if (c.query !== `` && !queries.has(c.componentPath)) {
      debug(`Static query was removed from ${c.componentPath}`)
      store.dispatch({
        type: `REMOVE_STATIC_QUERY`,
        payload: c.jsonName,
      })
      boundActionCreators.deleteComponentsDependencies([c.jsonName])
    }
  })
}

const handleQuery = (
  { components, staticQueryComponents },
  query,
  component
) => {
  // If this is a static query
  // Add action / reducer + watch staticquery files
  if (query.isStaticQuery) {
    const isNewQuery = !staticQueryComponents.has(query.jsonName)
    if (
      isNewQuery ||
      staticQueryComponents.get(query.jsonName).query !== query.text
    ) {
      boundActionCreators.replaceStaticQuery({
        name: query.name,
        componentPath: query.path,
        id: query.jsonName,
        jsonName: query.jsonName,
        query: query.text,
        hash: query.hash,
      })

      debug(
        `Static query in ${component} ${
          isNewQuery ? `was added` : `has changed`
        }.`
      )

      boundActionCreators.deleteComponentsDependencies([query.jsonName])
      queueQueryForPathname(query.jsonName)
    }
    return true

    // If this is page query
  } else if (components.has(component)) {
    if (components.get(component).query !== query.text) {
      boundActionCreators.replaceComponentQuery({
        query: query.text,
        componentPath: component,
      })

      debug(
        `Page query in ${component} ${
          components.get(component).query.length === 0
            ? `was added`
            : `has changed`
        }.`
      )
      queueQueriesForPageComponent(component)
    }
    return true
  }

  return false
}

const updateStateAndRunQueries = isFirstRun => {
  const snapshot = getQueriesSnapshot()
  return queryCompiler().then(queries => {
    handleComponentsWithRemovedQueries(snapshot, queries)

    let queriesWillNotRun = false
    queries.forEach((query, component) => {
      const queryWillRun = handleQuery(snapshot, query, component)

      if (queryWillRun) {
        watchComponent(component)
      } else if (isFirstRun) {
        report.warn(
          `The GraphQL query in the non-page component "${component}" will not be run.`
        )
        queriesWillNotRun = true
      }
    })

    if (queriesWillNotRun) {
      report.log(report.stripIndent`
        Exported queries are only executed for Page components. Instead of an exported
        query, either co-locate a GraphQL fragment and compose that fragment into the
        query (or other fragment) of the top-level page that renders this component, or
        use a <StaticQuery> in this component. For more info on fragments and
        composition, see http://graphql.org/learn/queries/#fragments and for more
        information on <StaticQuery>, see https://next.gatsbyjs.org/docs/static-query
      `)
    }
    runQueuedQueries()
  })
}

exports.extractQueries = () =>
  updateStateAndRunQueries(true).then(() => {
    // During development start watching files to recompile & run
    // queries on the fly.
    if (process.env.NODE_ENV !== `production`) {
      watch(store.getState().program.directory)
    }
  })

const queueQueriesForPageComponent = componentPath => {
  const pages = getPagesForComponent(componentPath)
  // Remove page data dependencies before re-running queries because
  // the changing of the query could have changed the data dependencies.
  // Re-running the queries will add back data dependencies.
  boundActionCreators.deleteComponentsDependencies(
    pages.map(p => p.path || p.id)
  )
  pages.forEach(page => queueQueryForPathname(page.path))
}

const getPagesForComponent = componentPath => {
  const state = store.getState()
  return [...state.pages.values()].filter(
    p => p.componentPath === componentPath
  )
}

const filesToWatch = new Set()
let watcher
const watchComponent = componentPath => {
  // We don't start watching until mid-way through the bootstrap so ignore
  // new components being added until then. This doesn't affect anything as
  // when extractQueries is called from bootstrap, we make sure that all
  // components are being watched.
  if (
    process.env.NODE_ENV !== `production` &&
    !filesToWatch.has(componentPath)
  ) {
    filesToWatch.add(componentPath)
    if (watcher) {
      watcher.add(componentPath)
    }
  }
}

exports.watchComponent = watchComponent

const watch = rootDir => {
  if (watcher) return
  const debounceCompile = _.debounce(() => {
    updateStateAndRunQueries()
  }, 100)

  watcher = chokidar
    .watch(slash(path.join(rootDir, `/src/**/*.{js,jsx,ts,tsx}`)))
    .on(`change`, path => {
      debounceCompile()
    })
  filesToWatch.forEach(filePath => watcher.add(filePath))
}
