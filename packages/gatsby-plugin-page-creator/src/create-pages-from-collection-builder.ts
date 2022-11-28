// Move this to gatsby-core-utils?
import { Actions, CreatePagesArgs } from "gatsby"
import { Reporter } from "gatsby/reporter"
import { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import type { TrailingSlash } from "gatsby-page-utils"
import { watchCollectionBuilder } from "./watch-collection-builder"
import { collectionExtractQueryString } from "./collection-extract-query-string"
import { isValidCollectionPathImplementation } from "./is-valid-collection-path-implementation"
import { CODES, prefixId } from "./error-utils"
import { getPluginInstance } from "./tracked-nodes-state"
import { extractModel } from "./path-utils"

interface ICreatePagesFromCollectionBuilderArgs {
  filePath: string
  absolutePath: string
  pagesPath: string
  actions: Actions
  graphql: CreatePagesArgs["graphql"]
  reporter: Reporter
  trailingSlash: TrailingSlash
  slugifyOptions?: ISlugifyOptions
}

export async function createPagesFromCollectionBuilder(
  args: ICreatePagesFromCollectionBuilderArgs
): Promise<void> {
  const { filePath, absolutePath, pagesPath, actions, graphql, reporter } =
    args || {}

  if (isValidCollectionPathImplementation(absolutePath, reporter) === false) {
    watchCollectionBuilder(absolutePath, ``, [], actions, reporter, () =>
      createPagesFromCollectionBuilder(args)
    )
    return
  }

  // 1. Query for the data for the collection to generate pages
  const queryString = collectionExtractQueryString(absolutePath, reporter)

  // 1.a  If the query string is not findable, we can't move on. So we stop and watch
  if (queryString === null) {
    watchCollectionBuilder(absolutePath, ``, [], actions, reporter, () =>
      createPagesFromCollectionBuilder(args)
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
      () => createPagesFromCollectionBuilder(args)
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

  let derivePathErrors = 0

  // Start listening for changes to this type
  const pluginInstance = getPluginInstance({ path: pagesPath })
  if (!pluginInstance.createAPageFromNode) {
    throw new Error(`Expected pluginInstance.createAPageFromNode to be defined`)
  }
  const nodeType = extractModel(absolutePath)

  let listOfTemplateFilePaths = pluginInstance.trackedTypes.get(nodeType)
  if (!listOfTemplateFilePaths) {
    listOfTemplateFilePaths = new Set()
    pluginInstance.trackedTypes.set(nodeType, listOfTemplateFilePaths)
  }
  listOfTemplateFilePaths.add(absolutePath)

  // 3. Loop through each node and create the page, also save the path it creates to pass to the watcher
  //    the watcher will use this data to delete the pages if the query changes significantly.
  const paths: Array<string> = []
  for (const node of nodes) {
    const createPageResult = await pluginInstance.createAPageFromNode({
      absolutePath,
      node,
    })

    if (createPageResult) {
      derivePathErrors += createPageResult.errors
      paths.push(createPageResult.path)
    }
  }

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
    () => createPagesFromCollectionBuilder(args)
  )
}
