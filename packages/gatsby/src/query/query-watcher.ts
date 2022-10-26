/***
 * Jobs of this module
 * - Maintain the list of components in the Redux store. So monitor new components
 *   and add/remove components.
 * - Watch components for query changes and extract these and update the store.
 * - Ensure all page queries are run as part of bootstrap and report back when
 *   this is done
 * - Whenever a query changes, re-run all pages that rely on this query.
 ***/

import chokidar, { FSWatcher } from "chokidar"
import { Span } from "opentracing"

import path from "path"
import { getPathToLayoutComponent } from "gatsby-core-utils/parse-component-path"
import { slash } from "gatsby-core-utils/path"

import { store, emitter } from "../redux/"
import { actions } from "../redux/actions"
import { IGatsbyStaticQueryComponents } from "../redux/types"
import queryCompiler from "./query-compiler"
import report from "gatsby-cli/lib/reporter"
import { getGatsbyDependents } from "../utils/gatsby-dependents"
import { processNodeManifests } from "../utils/node-manifest"

const debug = require(`debug`)(`gatsby:query-watcher`)

interface IComponent {
  componentPath: string
  query: string
  pages: Set<string>
  isInBootstrap: boolean
}

interface IQuery {
  id: string
  name: string
  text: string
  originalText: string
  path: string
  isHook: boolean
  isStaticQuery: boolean
  hash: string
}

interface IQuerySnapshot {
  components: Map<string, IComponent>
  staticQueryComponents: Map<string, IGatsbyStaticQueryComponents>
  componentsWithCleanFilePaths: Set<string>
}

const getQueriesSnapshot = (): IQuerySnapshot => {
  const state = store.getState()

  const componentsWithCleanFilePaths: Set<string> = new Set()

  state.components.forEach(c => {
    componentsWithCleanFilePaths.add(getPathToLayoutComponent(c.componentPath))
  })

  const snapshot: IQuerySnapshot = {
    components: new Map<string, IComponent>(state.components),
    staticQueryComponents: new Map<string, IGatsbyStaticQueryComponents>(
      state.staticQueryComponents
    ),
    componentsWithCleanFilePaths,
  }

  return snapshot
}

const handleComponentsWithRemovedQueries = (
  { staticQueryComponents }: IQuerySnapshot,
  queries: Map<string, IQuery>
): void => {
  // If a component had static query and it doesn't have it
  // anymore - update the store
  staticQueryComponents.forEach(c => {
    if (c.query !== `` && !queries.has(c.componentPath)) {
      debug(`Static query was removed from ${c.componentPath}`)
      store.dispatch({
        type: `REMOVE_STATIC_QUERY`,
        payload: c.id,
      })
    }
  })
}

const handleQuery = (
  { staticQueryComponents }: IQuerySnapshot,
  query: IQuery,
  component: string
): boolean => {
  // If this is a static query
  // Add action / reducer + watch staticquery files
  if (query.isStaticQuery) {
    const oldQuery = staticQueryComponents.get(query.id)
    const isNewQuery = !oldQuery

    // Compare query text because text is compiled query with any attached
    // fragments and we want to rerun queries if fragments are edited.
    // Compare hash because hash is used for identyfing query and
    // passing data to component in development. Hash can change if user will
    // format query text, but it doesn't mean that compiled text will change.
    if (
      isNewQuery ||
      oldQuery?.hash !== query.hash ||
      oldQuery?.query !== query.text
    ) {
      store.dispatch(
        actions.replaceStaticQuery({
          name: query.name,
          componentPath: query.path,
          id: query.id,
          query: query.text,
          hash: query.hash,
        })
      )

      debug(
        `Static query in ${component} ${
          isNewQuery ? `was added` : `has changed`
        }.`
      )
    }
    return true
  }

  return false
}

const filesToWatch = new Set<string>()
let watcher: FSWatcher

const watch = async (rootDir: string): Promise<void> => {
  if (watcher) return

  const modulesThatUseGatsby = await getGatsbyDependents()

  const packagePaths = modulesThatUseGatsby.map(module => {
    const filesRegex = `*.+(t|j)s?(x)`
    const pathRegex = `/{${filesRegex},!(node_modules)/**/${filesRegex}}`
    return slash(path.join(module.path, pathRegex))
  })

  watcher = chokidar
    .watch(
      [slash(path.join(rootDir, `/src/**/*.{js,jsx,ts,tsx}`)), ...packagePaths],
      { ignoreInitial: true, ignored: [`**/*.d.ts`] }
    )
    .on(`change`, path => {
      emitter.emit(`SOURCE_FILE_CHANGED`, path)
    })
    .on(`add`, path => {
      emitter.emit(`SOURCE_FILE_CHANGED`, path)
    })
    .on(`unlink`, path => {
      emitter.emit(`SOURCE_FILE_CHANGED`, path)
    })

  filesToWatch.forEach(filePath => watcher.add(filePath))
}

const watchComponent = (componentPath: string): void => {
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

/**
 * Removes components templates that aren't used by any page from redux store.
 */
const clearInactiveComponents = (): void => {
  const { components, pages, slices } = store.getState()

  const activeTemplates = new Set()
  pages.forEach(page => {
    // Set will guarantee uniqueness of entries
    activeTemplates.add(slash(page.componentPath))
  })
  slices.forEach(slice => {
    // Set will guarantee uniqueness of entries
    activeTemplates.add(slash(slice.componentPath))
  })

  components.forEach(component => {
    if (!activeTemplates.has(component.componentPath)) {
      debug(
        `${component.componentPath} component was removed because it isn't used by any page`
      )
      store.dispatch({
        type: `REMOVE_STATIC_QUERIES_BY_TEMPLATE`,
        payload: component,
      })
    }
  })
}

export const startWatchDeletePage = (): void => {
  emitter.on(`DELETE_PAGE`, action => {
    const componentPath = slash(action.payload.component)
    const { pages } = store.getState()
    let otherPageWithTemplateExists = false
    for (const page of pages.values()) {
      if (slash(page.component) === componentPath) {
        otherPageWithTemplateExists = true
        break
      }
    }
    if (!otherPageWithTemplateExists) {
      store.dispatch({
        type: `REMOVE_STATIC_QUERIES_BY_TEMPLATE`,
        payload: {
          componentPath,
        },
      })
    }
  })
}

export const updateStateAndRunQueries = async (
  isFirstRun: boolean,
  { parentSpan }: { parentSpan?: Span } = {}
): Promise<void> => {
  const snapshot = getQueriesSnapshot()
  const queries: Map<string, IQuery> = await queryCompiler({ parentSpan })
  // If there's an error while extracting queries, the queryCompiler returns false
  // or zero results.
  // Yeah, should probably be an error but don't feel like threading the error
  // all the way here.
  if (!queries || queries.size === 0) {
    return
  }
  handleComponentsWithRemovedQueries(snapshot, queries)

  // Run action for each component
  snapshot.components.forEach(c => {
    const { isStaticQuery = false, text = `` } =
      queries.get(c.componentPath) || {}

    store.dispatch(
      actions.queryExtracted({
        componentPath: c.componentPath,
        query: isStaticQuery ? `` : text,
      })
    )
  })

  let queriesWillNotRun = false
  queries.forEach((query, component) => {
    const queryWillRun = handleQuery(snapshot, query, component)

    if (queryWillRun) {
      watchComponent(component)
      // Check if this is a page component.
      // If it is and this is our first run during bootstrap,
      // show a warning about having a query in a non-page component.
    } else if (
      isFirstRun &&
      !snapshot.componentsWithCleanFilePaths.has(
        getPathToLayoutComponent(component)
      )
    ) {
      report.warn(
        `The GraphQL query in the non-page component "${component}" will not be run.`
      )
      queriesWillNotRun = true
    }
  })

  if (queriesWillNotRun) {
    report.log(report.stripIndent`

        Exported queries are only executed for page components. It's possible you're trying to create pages in your gatsby-node.js and that's failing for some reason.

        If the failing component is a regular component and not intended to be a page component, you generally want to use "useStaticQuery" (https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/) instead of exporting a page query.

        If you're more experienced with GraphQL, you can also export GraphQL fragments from components and compose the fragments in the Page component query and pass data down into the child component (https://www.gatsbyjs.com/docs/reference/graphql-data-layer/using-graphql-fragments/)

      `)
  }

  if (process.env.NODE_ENV === `development`) {
    /**
     * only process node manifests here in develop. we want this to run every time queries are updated. for gatsby build we process node manifests in src/utils/page-data.ts after all queries are run and pages are created. If we process node manifests in this location for gatsby build we wont have all the information needed to create the manifests. If we don't process manifests in this location during gatsby develop manifests will only be written once and never again when more manifests are created.
     */
    await processNodeManifests()
  }
}

export const extractQueries = ({
  parentSpan,
}: { parentSpan?: Span } = {}): Promise<void> => {
  // Remove template components that point to not existing page templates.
  // We need to do this, because components data is cached and there might
  // be changes applied when development server isn't running. This is needed
  // only in initial run, because during development state will be adjusted.
  clearInactiveComponents()

  return updateStateAndRunQueries(true, { parentSpan }).then(() => {
    // During development start watching files to recompile & run
    // queries on the fly.

    // TODO: move this into a spawned service
    if (process.env.NODE_ENV !== `production`) {
      watch(store.getState().program.directory)
    }
  })
}
