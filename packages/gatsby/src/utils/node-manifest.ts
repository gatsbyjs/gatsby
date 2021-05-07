import { IGatsbyPage, INodeManifest } from "./../redux/types"
import reporter from "gatsby-cli/lib/reporter"
import { store } from "../redux/"
import { internalActions } from "../redux/actions"
import path from "path"
import fs from "fs-extra"

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
}

type FoundPageBy =
  | `ownerNodeId`
  | `context.id`
  | `queryTracking`
  | `filesystem-route-api`
  | `none`

/**
 * Finds a final built page by nodeId
 *
 * Note that this function wont work properly in `gatsby develop`
 * since develop no longer runs all page queries when creating pages.
 * We use the node id to query mapping to find the right page but
 * this mapping only exists once you've visited a page in your browser.
 * When this fn is being used for routing to previews the user wont necessarily have
 * visited the page in the browser yet.
 */
async function findPageOwnedByNodeId({
  nodeId,
}: {
  nodeId: string
}): Promise<{
  page: INodeManifestPage
  foundPageBy: FoundPageBy
}> {
  const state = store.getState()
  const { pages, nodes } = state
  const pagesBynode = state.queries.byNode

  // in development queries are run on demand so we wont have an accurate nodeId->pages map until those pages are visited in the browser. We want this mapping before the page is visited in the browser so we can route to the right page in the browser.
  // So in development we can just use the Map of all pages (pagePath -> pageNode)
  // but for builds (preview inc builds or regular builds) we will have a full map
  // of all nodeId's to pages they're queried on and we can use that instead since it
  // will be a much smaller list of pages, resulting in better performance for large sites
  const usingPagesMapInDevelop: boolean = process.env.NODE_ENV === `development`
  const pagePathSetOrMap = usingPagesMapInDevelop
    ? pages
    : pagesBynode.get(nodeId)

  // the default page path is the first page found in
  // node id to page query tracking
  let pagePath = usingPagesMapInDevelop
    ? null
    : pagePathSetOrMap?.values()?.next()?.value

  let foundPageBy: FoundPageBy = pagePath ? `queryTracking` : `none`

  // but if we have more than one page where this node shows up
  // we need to try to be more specific
  if (pagePathSetOrMap && pagePathSetOrMap.size > 1) {
    let ownerPagePath: string | undefined
    let foundOwnerNodeId = false

    // for each page this nodeId is queried in
    pagePathSetOrMap.forEach((...args) => {
      if (
        // if we haven't found a page with this nodeId
        // set as page.ownerNodeId then run this logic.
        // this condition is on foundOwnerNodeId instead of ownerPagePath
        // in case we find a page with the nodeId in page.context.id
        // and then later in the loop there's a page with this nodeId
        // set on page.ownerNodeId.
        // We always want to prefer ownerPagePath over context.id
        !foundOwnerNodeId
      ) {
        const path: string = usingPagesMapInDevelop
          ? // in development this is a Map, so the page path is the second arg (the key)
            args[1]
          : // in builds we're using a Set so the page path is the first arg (the value)
            args[0]

        const fullPage: IGatsbyPage | undefined = pages.get(path)

        foundOwnerNodeId = fullPage?.ownerNodeId === nodeId

        const foundPageIdInContext = fullPage?.context.id === nodeId

        if (foundOwnerNodeId) {
          foundPageBy = `ownerNodeId`
        } else if (foundPageIdInContext && fullPage) {
          const pageCreatedByPluginName = nodes.get(fullPage.pluginCreatorId)
            ?.name

          const pageCreatedByFilesystemPlugin =
            pageCreatedByPluginName === `gatsby-plugin-page-creator`

          foundPageBy = pageCreatedByFilesystemPlugin
            ? `filesystem-route-api`
            : `context.id`
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
            foundPageIdInContext)
        ) {
          // save this path to use in our manifest!
          ownerPagePath = fullPage.path
        }
      }
    })

    if (ownerPagePath) {
      pagePath = ownerPagePath
    }
  }

  debugger

  return {
    page: {
      path: pagePath || null,
    },
    foundPageBy,
  }
}

/**
 * Takes in some info about a node manifest and the page we did or didn't find for it, then warns and returns the warning string
 */
export function warnAboutNodeManifestMappingProblems(
  {
    inputManifest,
    pagePath,
    foundPageBy,
  }: {
    inputManifest: INodeManifest
    pagePath?: string
    foundPageBy: FoundPageBy
  },
  // allows overriding the reporter for tests
  { reporterFn }: { reporterFn: typeof reporter } = { reporterFn: reporter }
): { message: string; possibleMessages: { [key in FoundPageBy]: string } } {
  const warnings = {
    shared: `Plugin ${inputManifest.pluginName} called unstable_createNodeManifest() for node id "${inputManifest.node.id}" with a manifest id of "${inputManifest.manifestId}"`,
    noOwnerNodeId: `but Gatsby didn't find a ownerNodeId for the page at ${pagePath}\n`,
    possiblyInaccurate: `This may result in an inaccurate node manifest (for previews or other purposes).`,
  }

  const success = `success` as const

  const messages = {
    // @todo add docs link to "using Preview" once it's updated with an explanation of ownerNodeId
    none: `${warnings.shared} but Gatsby couldn't find a page for this node.
    If you want a manifest to be created for this node (for previews or other purposes), ensure that a page was created (and that a ownerNodeId is added to createPage() if you're not using the Filesystem Route API).\n` as const,

    // @todo add docs link to "using Preview" once it's updated with an explanation of ownerNodeId
    [`context.id`]: `${warnings.shared} ${warnings.noOwnerNodeId}Using the first page that was found with the node manifest id set in pageContext.id in createPage().\n${warnings.possiblyInaccurate}` as const,

    // @todo add docs link to "using Preview" once it's updated with an explanation of ownerNodeId
    queryTracking: `${warnings.shared} ${warnings.noOwnerNodeId}Using the first page where this node is queried.\n${warnings.possiblyInaccurate}` as const,

    ownerNodeId: success,
    [`filesystem-route-api`]: success,
  }

  const messageValues = Object.values(messages)
  type MessageValues = typeof messageValues[number]

  let message: MessageValues

  switch (foundPageBy) {
    case `none`:
    case `context.id`:
    case `queryTracking`: {
      message = messages[foundPageBy]
      reporterFn.warn(message)
      break
    }

    case `filesystem-route-api`:
    case `ownerNodeId`:
      message = success
      break

    default: {
      throw Error(`Node Manifest mapping is in an impossible state`)
    }
  }

  return {
    message,
    possibleMessages: messages,
  }
}

/**
 * Prepares and then writes out an individual node manifest file to be used for routing to previews. Manifest files are added via the public unstable_createNodeManifest action
 */
async function processNodeManifest(
  inputManifest: INodeManifest,
  { fsFn = fs, findPageOwnedByNodeIdFn = findPageOwnedByNodeId }
): Promise<void> {
  // map the node to a page that was created
  const { page: nodeManifestPage, foundPageBy } = await findPageOwnedByNodeIdFn(
    {
      nodeId: inputManifest.node.id,
    }
  )

  warnAboutNodeManifestMappingProblems({
    inputManifest,
    pagePath: nodeManifestPage.path,
    foundPageBy,
  })

  const finalManifest: INodeManifestOut = {
    node: inputManifest.node,
    page: nodeManifestPage,
  }

  // write out the manifest file
  const manifestFilePath = path.join(
    process.cwd(),
    `.cache`,
    `node-manifests`,
    inputManifest.pluginName,
    `${inputManifest.manifestId}.json`
  )

  const manifestFileDir = path.dirname(manifestFilePath)

  await fsFn.ensureDir(manifestFileDir)
  await fsFn.writeJSON(manifestFilePath, finalManifest)
}

/**
 * Grabs all pending node manifests, processes them, writes them to disk,
 * and then removes them from the store.
 * Manifest files are added via the public unstable_createNodeManifest action in sourceNodes
 */
export async function processNodeManifests(): Promise<void> {
  const { nodeManifests } = store.getState()

  const totalManifests = nodeManifests.length

  if (totalManifests === 0) {
    return
  }

  await Promise.all(nodeManifests.map(processNodeManifest))

  reporter.info(
    `Wrote out ${totalManifests} node page manifest file${
      totalManifests > 1 ? `s` : ``
    }`
  )

  // clean up all pending manifests from the store
  store.dispatch(internalActions.deleteNodeManifests())
}
