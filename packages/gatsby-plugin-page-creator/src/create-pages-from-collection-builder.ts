// Move this to gatsby-core-utils?
import { Actions, CreatePagesArgs } from "gatsby"
import { createPath } from "gatsby-page-utils"
import { Reporter } from "gatsby/reporter"
import { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import { reverseLookupParams } from "./extract-query"
import { getMatchPath } from "gatsby-core-utils"
import { getCollectionRouteParams } from "./get-collection-route-params"
import { derivePath } from "./derive-path"
import { watchCollectionBuilder } from "./watch-collection-builder"
import { collectionExtractQueryString } from "./collection-extract-query-string"
import { isValidCollectionPathImplementation } from "./is-valid-collection-path-implementation"
import { CODES, prefixId } from "./error-utils"
import { extractModel } from "./path-utils"

const pluginInstances = new Map()

function createPathFromNode({ filePath, node, reporter, slugifyOptions }) {
  const { derivedPath, errors } = derivePath(
    filePath,
    node,
    reporter,
    slugifyOptions
  )
  return { path: createPath(derivedPath), errors }
}

export function createDeletePages({ tick, actions, reporter }, pluginOptions) {
  // Loop over deleted/created nodes and delete nodes and create nodes
  // we haven't seen before and then reset arrays.
  const trackedTypes = pluginInstances.get(pluginOptions.path)

  if (trackedTypes?.size > 0) {
    console.log({
      trackedTypes,
      pluginInstances,
      tick,
    })

    const nodeTypes = Array.from(trackedTypes.keys())
    console.log({ nodeTypes })

    // Loop through deleted nodes and delete any tracked pages
    Array.from(tick.get(`changedNodes`).deleted.values()).forEach(
      ({ node }) => {
        if (nodeTypes.includes(node.internal.type)) {
          const absolutePath = trackedTypes.get(node.internal.type).absolutePath
          const { path, errors } = createPathFromNode({
            filePath: absolutePath,
            node,
            reporter,
            slugifyOptions: pluginOptions.slugifyOptions,
          })
          console.log(`deleting page`, { path, component: absolutePath })
          actions.deletePage({ path, component: absolutePath })
        }
      }
    )

    // Loop through created nodes and create pages for them.
    Array.from(tick.get(`changedNodes`).created.values()).forEach(
      ({ node }) => {
        if (nodeTypes.includes(node.internal.type)) {
          const absolutePath = trackedTypes.get(node.internal.type).absolutePath
          const { path, errors } = createPathFromNode({
            filePath: absolutePath,
            node,
            reporter,
            slugifyOptions: pluginOptions.slugifyOptions,
          })

          const params = getCollectionRouteParams(
            createPath(absolutePath),
            path
          )
          // nodeParams is fed to the graphql query for the component
          const nodeParams = reverseLookupParams(node, absolutePath)

          console.log(`creating page`, {
            path: path,
            component: trackedTypes.get(node.internal.type).absolutePath,
            context: {
              ...nodeParams,
              __params: params,
            },
          })
          actions.createPage({
            path: path,
            component: trackedTypes.get(node.internal.type).absolutePath,
            context: {
              ...nodeParams,
              __params: params,
            },
          })
        }
      }
    )
  }
}

export async function createPagesFromCollectionBuilder(
  filePath: string,
  absolutePath: string,
  actions: Actions,
  graphql: CreatePagesArgs["graphql"],
  reporter: Reporter,
  slugifyOptions?: ISlugifyOptions,
  pagesPath
): Promise<void> {
  // This is VERY hacky
  // disable collection routes for PSU so they can create a subset of story
  // pages in preview and then create the full set w/ fs routes
  // for production publishing to get incremental goodness.
  //
  // To get them back on mainline, we'll need to add a way for a fs route
  // to disable itself under certaiin conditions.
  if (process.env.GATSBY_IS_PREVIEW === `true`) {
    return
  }
  if (isValidCollectionPathImplementation(absolutePath, reporter) === false) {
    watchCollectionBuilder(absolutePath, ``, [], actions, reporter, () =>
      createPagesFromCollectionBuilder(
        filePath,
        absolutePath,
        actions,
        graphql,
        reporter,
        slugifyOptions,
        pagesPath
      )
    )
    return
  }

  // 1. Query for the data for the collection to generate pages
  const queryString = collectionExtractQueryString(absolutePath, reporter)

  // 1.a  If the query string is not findable, we can't move on. So we stop and watch
  if (queryString === null) {
    watchCollectionBuilder(absolutePath, ``, [], actions, reporter, () =>
      createPagesFromCollectionBuilder(
        filePath,
        absolutePath,
        actions,
        graphql,
        reporter,
        slugifyOptions,
        pagesPath
      )
    )
    return
  }

  const { data, errors } = await graphql<{ nodes: Record<string, unknown> }>(
    queryString
  )

  // 1.a If it fails, we need to inform the user and exit early
  if (!data || errors) {
    reporter.error({
      id: prefixId(CODES.CollectionBuilder),
      context: {
        sourceMessage: `Tried to create pages from the collection builder.
Unfortunately, the query came back empty. There may be an error in your query:

${errors.map(error => error.message).join(`\n`)}`.trim(),
      },
      filePath: absolutePath,
    })

    watchCollectionBuilder(
      absolutePath,
      queryString,
      [],
      actions,
      reporter,
      () =>
        createPagesFromCollectionBuilder(
          filePath,
          absolutePath,
          actions,
          graphql,
          reporter,
          slugifyOptions,
          pagesPath
        )
    )

    return
  }

  // 2. Get the nodes out of the data. We very much expect data to come back in a known shape:
  //    data = { [key: string]: { nodes: Array<ACTUAL_DATA> } }
  const nodes = Object.values(Object.values(data)[0])[0] as any as Array<
    Record<string, Record<string, unknown>>
  >

  if (nodes) {
    reporter.verbose(
      `   PageCreator: Creating ${nodes.length} page${
        nodes.length > 1 ? `s` : ``
      } from ${filePath}`
    )
  }

  // Start listening for changes to this type
  console.log({ pagesPath })
  let trackedTypes = pluginInstances.get(pagesPath)
  const nodeType = extractModel(absolutePath)
  if (trackedTypes) {
    trackedTypes.set(nodeType, { nodeType, absolutePath })
  } else {
    trackedTypes = new Map()
    trackedTypes.set(nodeType, { nodeType, absolutePath })
    pluginInstances.set(pagesPath, trackedTypes)
  }

  console.log(
    `creating ${nodes.length} pages for ${extractModel(absolutePath)}`
  )

  let derivePathErrors = 0

  const knownPagePaths = new Set<string>()

  // 3. Loop through each node and create the page, also save the path it creates to pass to the watcher
  //    the watcher will use this data to delete the pages if the query changes significantly.
  const paths: Array<string> = []
  nodes.forEach((node: Record<string, Record<string, unknown>>) => {
    // URL path for the component and node
    const { derivedPath, errors } = derivePath(
      filePath,
      node,
      reporter,
      slugifyOptions
    )
    const path = createPath(derivedPath)
    // We've already created a page with this path
    if (knownPagePaths.has(path)) {
      return
    }
    knownPagePaths.add(path)
    // Params is supplied to the FE component on props.params
    const params = getCollectionRouteParams(createPath(filePath), path)
    // nodeParams is fed to the graphql query for the component
    const nodeParams = reverseLookupParams(node, absolutePath)
    // matchPath is an optional value. It's used if someone does a path like `{foo}/[bar].js`
    const matchPath = getMatchPath(path)

    actions.createPage({
      path: path,
      matchPath,
      component: absolutePath,
      context: {
        ...nodeParams,
        __params: params,
      },
    })

    derivePathErrors += errors

    paths.push(path)
  })

  if (derivePathErrors > 0) {
    reporter.panicOnBuild({
      id: prefixId(CODES.GeneratePath),
      context: {
        sourceMessage: `Could not find a value in the node for ${filePath}. Please make sure that the syntax is correct and supported.`,
      },
    })
  }

  watchCollectionBuilder(
    absolutePath,
    queryString,
    paths,
    actions,
    reporter,
    () =>
      createPagesFromCollectionBuilder(
        filePath,
        absolutePath,
        actions,
        graphql,
        reporter,
        slugifyOptions,
        pagesPath
      )
  )
}
