import type { ErrorId } from "gatsby-cli/lib/structured-errors/error-map"
import { getNode } from "./../datastore"
import { IGatsbyNode, IGatsbyPage, INodeManifest } from "./../redux/types"
import reporter from "gatsby-cli/lib/reporter"
import { store } from "../redux/"
import { internalActions } from "../redux/actions"
import path from "path"
import fs from "fs-extra"
import fastq from "fastq"

interface INodeManifestPage {
  path?: string
}

/**
 * This it the output after processing calls to the public unstable_createNodeManifest action
 */
interface INodeManifestOut {
  page: INodeManifestPage
  node: {
    id: string
  }
  foundPageBy: FoundPageBy
}

type FoundPageBy =
  | `ownerNodeId`
  | `filesystem-route-api`
  // for these three we warn to use ownerNodeId instead
  | `context.id`
  | `context.slug`
  | `queryTracking`
  | `none`

type PreviouslyWrittenNodeManifests = Map<string, Promise<INodeManifestOut>>

function getNodeManifestFileLimit(): number {
  const defaultLimit = 10000

  const overrideLimit =
    process.env.NODE_MANIFEST_FILE_LIMIT &&
    Number(process.env.NODE_MANIFEST_FILE_LIMIT)

  return overrideLimit || defaultLimit
}
/**
 * This defines a limit to the number number of node manifest files that will be written to disk
 */
const NODE_MANIFEST_FILE_LIMIT = getNodeManifestFileLimit()

/**
 * Finds a final built page by nodeId or by node.slug as a fallback.
 *
 * Note that this function wont work properly in `gatsby develop`
 * since develop no longer runs all page queries when creating pages.
 * We use the node id to query mapping to find the right page but
 * this mapping only exists once you've visited a page in your browser.
 * When this fn is being used for routing to previews the user wont necessarily have
 * visited the page in the browser yet.
 */
async function findPageOwnedByNode({
  nodeId,
  fullNode,
  slug,
}: {
  nodeId: string
  fullNode: IGatsbyNode
  slug?: string
}): Promise<{
  page: INodeManifestPage
  foundPageBy: FoundPageBy
}> {
  const state = store.getState()
  const { pages, staticQueryComponents } = state
  const { byNode, byConnection, trackedComponents } = state.queries

  const nodeType = fullNode?.internal?.type

  const firstPagePathWithNodeAsDataDependency =
    // the first page found in node id to page query path tracking
    byNode?.get(nodeId)?.values()?.next()?.value

  const firstPagePathWithNodeInGraphQLListField =
    // the first page that queries for a list of this node type.
    // we don't currently store a list of node ids for connection fields to queries
    // we just store the query id or page path mapped to the connected GraphQL typename.
    byConnection?.get(nodeType)?.values()?.next()?.value

  let pagePath =
    firstPagePathWithNodeAsDataDependency ||
    firstPagePathWithNodeInGraphQLListField

  // for static queries, we can only find the first page using that static query
  // the reason we would find `sq--` here is because byConnection (above) can return a page path or a static query ID (which starts with `sq--`)
  if (pagePath?.startsWith(`sq--`)) {
    const staticQueryComponentPath =
      staticQueryComponents?.get(pagePath)?.componentPath

    const firstPagePathUsingStaticQueryComponent: string | null =
      staticQueryComponentPath
        ? trackedComponents
            ?.get(staticQueryComponentPath)
            ?.pages?.values()
            ?.next()?.value
        : null

    pagePath = firstPagePathUsingStaticQueryComponent
  }

  let foundPageBy: FoundPageBy = pagePath ? `queryTracking` : `none`

  if (pages) {
    let ownerPagePath: string | undefined
    let foundOwnerNodeId = false

    // for each page this nodeId is queried in
    for (const pageObject of pages.values()) {
      // if we haven't found a page with this nodeId
      // set as page.ownerNodeId then run this logic.
      // this condition is on foundOwnerNodeId instead of ownerPagePath
      // in case we find a page with the nodeId in page.context.id/context.slug
      // and then later in the loop there's a page with this nodeId
      // set on page.ownerNodeId.
      // We always want to prefer ownerPagePath over context.id/context.slug
      if (foundOwnerNodeId) {
        break
      }

      const path = pageObject.path

      const fullPage: IGatsbyPage | undefined = pages.get(path)

      foundOwnerNodeId = fullPage?.ownerNodeId === nodeId

      const foundPageIdInContext = fullPage?.context?.id === nodeId

      // querying by node.slug in GraphQL queries is common enough that we can search for it as a fallback after ownerNodeId, filesystem routes, and context.id
      const foundPageSlugInContext = slug && fullPage?.context?.slug === slug

      if (foundOwnerNodeId) {
        foundPageBy = `ownerNodeId`
      } else if (foundPageIdInContext && fullPage) {
        const pageCreatedByPluginName = getNode(fullPage.pluginCreatorId)?.name

        const pageCreatedByFilesystemPlugin =
          pageCreatedByPluginName === `gatsby-plugin-page-creator`

        foundPageBy = pageCreatedByFilesystemPlugin
          ? `filesystem-route-api`
          : `context.id`
      } else if (foundPageSlugInContext && fullPage) {
        foundPageBy = `context.slug`
      }

      if (
        fullPage &&
        // first check for the ownerNodeId on the page. this is
        // the defacto owner. Can't get more specific than this
        (foundOwnerNodeId ||
          // if there's no specified owner look to see if
          // pageContext has an `id` variable which matches our
          // nodeId. Using an "id" as a variable in queries is common
          // and if we don't have an owner this is a better guess
          // of an owner than grabbing the first page query we find
          // that's mapped to this node id.
          // this also makes this work with the filesystem Route API without
          // changing that API.
          foundPageIdInContext ||
          foundPageSlugInContext)
      ) {
        // save this path to use in our manifest!
        ownerPagePath = fullPage.path
      }
    }

    if (ownerPagePath) {
      pagePath = ownerPagePath
    }
  }

  return {
    page: {
      path: pagePath || null,
    },
    foundPageBy,
  }
}

// these id's correspond to error id's in
// packages/gatsby-cli/src/structured-errors/error-map.ts
export const foundPageByToLogIds = {
  none: `11801`,
  [`context.id`]: `11802`,
  [`context.slug`]: `11805`,
  queryTracking: `11803`,
  [`filesystem-route-api`]: `success`,
  ownerNodeId: `success`,
}

/**
 * Takes in some info about a node manifest and the page we did or didn't find for it, then warns and returns the warning string
 */
export function warnAboutNodeManifestMappingProblems({
  inputManifest,
  pagePath,
  foundPageBy,
  verbose,
}: {
  inputManifest: INodeManifest
  pagePath?: string
  foundPageBy: FoundPageBy
  verbose: boolean
}): { logId: string } {
  let logId: ErrorId | `success`

  switch (foundPageBy) {
    case `none`:
    case `context.id`:
    case `context.slug`:
    case `queryTracking`: {
      logId = foundPageByToLogIds[foundPageBy]
      if (verbose) {
        reporter.error({
          id: logId,
          context: {
            inputManifest,
            pagePath,
          },
        })
      }
      break
    }

    case `filesystem-route-api`:
    case `ownerNodeId`:
      logId = `success`
      break

    default: {
      throw Error(`Node Manifest mapping is in an impossible state`)
    }
  }

  return {
    logId,
  }
}

/**
 * Prepares and then writes out an individual node manifest file to be used for routing to previews. Manifest files are added via the public unstable_createNodeManifest action
 */
export async function processNodeManifest(
  inputManifest: INodeManifest,
  listOfUniqueErrorIds: Set<string>,
  nodeManifestPagePathMap: Map<string, string>,
  verboseLogs: boolean,
  previouslyWrittenNodeManifests: PreviouslyWrittenNodeManifests
): Promise<null | INodeManifestOut> {
  const nodeId = inputManifest.node.id
  const fullNode = getNode(nodeId)
  const noNodeWarningId = `11804`

  if (!fullNode) {
    if (verboseLogs) {
      reporter.error({
        id: noNodeWarningId,
        context: {
          pluginName: inputManifest.pluginName,
          nodeId,
        },
      })
    } else {
      listOfUniqueErrorIds.add(noNodeWarningId)
    }

    return null
  }

  // map the node to a page that was created
  const { page: nodeManifestPage, foundPageBy } = await findPageOwnedByNode({
    nodeId,
    fullNode,
    // querying by node.slug in GraphQL queries is common enough that we can search for it as a fallback after ownerNodeId, filesystem routes, and context.id
    slug: fullNode?.slug as string,
  })

  const nodeManifestMappingProblemsContext = {
    inputManifest,
    pagePath: nodeManifestPage.path,
    foundPageBy,
    verbose: verboseLogs,
  }

  if (verboseLogs) {
    warnAboutNodeManifestMappingProblems(nodeManifestMappingProblemsContext)
  } else {
    const { logId } = warnAboutNodeManifestMappingProblems(
      nodeManifestMappingProblemsContext
    )

    if (logId !== `success`) {
      listOfUniqueErrorIds.add(logId)
    }
  }

  const finalManifest: INodeManifestOut = {
    node: inputManifest.node,
    page: nodeManifestPage,
    foundPageBy,
  }

  const gatsbySiteDirectory = store.getState().program.directory

  let fileNameBase = inputManifest.manifestId

  /**
   * Windows has a handful of special/reserved characters that are not valid in a file path
   * @reference https://superuser.com/questions/358855/what-characters-are-safe-in-cross-platform-file-names-for-linux-windows-and-os
   *
   * The two exceptions to the list linked above are
   * - the colon that is part of the hard disk partition name at the beginning of a file path (i.e. C:)
   * - backslashes. We don't want to replace backslashes because those are used to delineate what the actual file path is
   *
   * During local development, node manifests can be written to disk but are generally unused as they are only used
   * for Content Sync which runs in Gatsby Cloud. Gatsby cloud is a Linux environment in which these special chars are valid in
   * filepaths. To avoid errors on Windows, we replace all instances of the special chars in the filepath (with the exception of the
   * hard disk partition name) with "-" to ensure that local Windows development setups do not break when attempting
   * to write one of these manifests to disk.
   */
  if (process.platform === `win32`) {
    fileNameBase = fileNameBase.replace(/:|\/|\*|\?|"|<|>|\||\\/g, `-`)
  }

  // write out the manifest file
  const manifestFilePath = path.join(
    gatsbySiteDirectory,
    `public`,
    `__node-manifests`,
    inputManifest.pluginName,
    `${fileNameBase}.json`
  )

  const manifestFileDir = path.dirname(manifestFilePath)

  await fs.ensureDir(manifestFileDir)

  const previouslyWrittenNodeManifest =
    await previouslyWrittenNodeManifests.get(inputManifest.manifestId)

  // write a manifest if we don't currently have one written for this ID
  // or if we can replace the written one with a manifest that has found a page
  // NOTE: We still want to write out a manifest if foundPageBy is "none", this helps with error messaging
  //       But we prefer to write a manifest that has a foundPageBy that is NOT "none"
  const shouldWriteManifest =
    !previouslyWrittenNodeManifest ||
    (previouslyWrittenNodeManifest?.foundPageBy === `none` &&
      finalManifest.foundPageBy !== `none`)

  if (shouldWriteManifest) {
    const writePromise = fs.writeJSON(manifestFilePath, finalManifest)

    // This prevents two manifests from writing to the same file at the same time
    previouslyWrittenNodeManifests.set(
      inputManifest.manifestId,
      new Promise(resolve => {
        writePromise.then(() => {
          resolve(finalManifest)
        })
      })
    )

    await writePromise
  }

  if (shouldWriteManifest && verboseLogs) {
    reporter.info(
      `Plugin ${inputManifest.pluginName} created a manifest with the id ${fileNameBase}`
    )
  } else if (verboseLogs) {
    reporter.info(
      `Plugin ${inputManifest.pluginName} created a manifest with the id ${fileNameBase} but it was not written to disk because it was already written to disk previously.`
    )
  }

  if (nodeManifestPage.path) {
    nodeManifestPagePathMap.set(nodeManifestPage.path, fileNameBase)
  }

  return finalManifest
}

function nodeManifestSortComparerAscendingUpdatedAt(a, b): number {
  /**
   * Prioritize node manifests that have an updatedAtUTC so that manifests known to be
   * newest are written to disk first. If neither have an updatedAtUTC, there isn't
   * anything to sort
   */
  if (!a.updatedAtUTC && !b.updatedAtUTC) {
    return 0
  }

  if (!a.updatedAtUTC) {
    return 1
  }

  if (!b.updatedAtUTC) {
    return -1
  }

  return Date.parse(a.updatedAtUTC) - Date.parse(b.updatedAtUTC)
}

/**
 * Grabs all pending node manifests, processes them, writes them to disk,
 * and then removes them from the store.
 * Manifest files are added via the public unstable_createNodeManifest action in sourceNodes
 */
export async function processNodeManifests(): Promise<Map<
  string,
  string
> | null> {
  const verboseLogs =
    process.env.gatsby_log_level === `verbose` ||
    process.env.VERBOSE_NODE_MANIFEST === `true`

  const startTime = Date.now()
  let { nodeManifests } = store.getState()

  const totalManifests = nodeManifests.length

  if (totalManifests === 0) {
    return null
  }

  let totalProcessedManifests = 0
  let totalFailedManifests = 0
  const nodeManifestPagePathMap: Map<string, string> = new Map()
  const listOfUniqueErrorIds: Set<string> = new Set()
  const previouslyWrittenNodeManifests: PreviouslyWrittenNodeManifests =
    new Map()

  async function processNodeManifestTask(
    manifest: INodeManifest,
    cb: fastq.done<any>
  ): Promise<void> {
    const processedManifest = await processNodeManifest(
      manifest,
      listOfUniqueErrorIds,
      nodeManifestPagePathMap,
      verboseLogs,
      previouslyWrittenNodeManifests
    )

    if (processedManifest) {
      totalProcessedManifests++
    } else {
      totalFailedManifests++
    }

    // `setImmediate` below is a workaround against stack overflow
    // occurring when there are many manifests
    setImmediate(() => cb(null, true))
    return
  }

  const processNodeManifestQueue = fastq(processNodeManifestTask, 25)

  if (totalManifests > NODE_MANIFEST_FILE_LIMIT) {
    nodeManifests = [...nodeManifests]
    nodeManifests.sort(nodeManifestSortComparerAscendingUpdatedAt)
    nodeManifests = nodeManifests.slice(0, NODE_MANIFEST_FILE_LIMIT)
  }

  for (const manifest of nodeManifests) {
    processNodeManifestQueue.push(manifest, () => {})
  }

  if (!processNodeManifestQueue.idle()) {
    await new Promise(resolve => {
      processNodeManifestQueue.drain = resolve as () => unknown
    })
  }

  const pluralize = (length: number): string =>
    length > 1 || length === 0 ? `s` : ``

  const endTime = Date.now()

  reporter.info(
    `Wrote out ${totalProcessedManifests} node page manifest file${pluralize(
      totalProcessedManifests
    )} in ${endTime - startTime} ms. ${
      totalFailedManifests > 0
        ? `. ${totalFailedManifests} manifest${pluralize(
            totalFailedManifests
          )} couldn't be processed.`
        : ``
    }`
  )

  reporter.info(
    (!verboseLogs && listOfUniqueErrorIds.size > 0
      ? `unstable_createNodeManifest produced warnings [${[
          ...listOfUniqueErrorIds,
        ].join(`, `)}]. `
      : ``) +
      `To see full warning messages set process.env.VERBOSE_NODE_MANIFEST to "true".\nVisit https://gatsby.dev/nodemanifest for more info on Node Manifests.`
  )

  // clean up all pending manifests from the store
  store.dispatch(internalActions.deleteNodeManifests())
  return nodeManifestPagePathMap
}
