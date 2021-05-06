import { internalActions } from "../redux/actions"
import path from "path"
import fs from "fs-extra"

/**
 * This is the input for the public unstable_createNodeManifest action
 */
interface INodeManifestIn {
  manifestId: string
  pluginName: string
  node: {
    id: string
  }
}

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
  store,
}: {
  nodeId: string
  store: any
}): Promise<INodeManifestPage> {
  const state = store.getState()
  const { pages } = state
  const pagesBynode = state.queries.byNode
  const pagePathSet = pagesBynode.get(nodeId)

  // the default page path is the first page found in
  // node id to page query tracking
  let pagePath = pagePathSet?.values()?.next()?.value

  // but if we have more than one page where this node shows up
  // we need to try to be more specific
  if (pagePathSet && pagePathSet.size > 1) {
    let ownerPagePath: string | undefined
    let foundOwnerNodeId = false

    // for each page this nodeId is queried in
    pagePathSet.forEach(path => {
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
        // get the page node
        const fullPage = pages.get(path)

        foundOwnerNodeId = fullPage.ownerNodeId === nodeId

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
            fullPage.context.id === nodeId)
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

  return {
    path: pagePath || null,
  }
}

/**
 * Prepares and then writes out an individual node manifest file to be used for routing to previews. Manifest files are added via the public unstable_createNodeManifest action
 */
async function processNodeManifest({
  inputManifest,
  store,
  reporter,
}: {
  inputManifest: INodeManifestIn
  store: any
  reporter: any
}): Promise<void> {
  // map the node to a page that was created
  const nodeManifestPage = await findPageOwnedByNodeId({
    nodeId: inputManifest.node.id,
    store,
  })

  if (!nodeManifestPage) {
    reporter.warn(
      `Plugin ${inputManifest.pluginName} called unstable_createNodeManifest for node id ${inputManifest.node.id} with a manifest id of ${inputManifest.manifestId} but your Gatsby site didn't create a page for this node.`
    )
  }

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

  await fs.ensureDir(manifestFileDir)
  await fs.writeJSON(manifestFilePath, finalManifest)
}

/**
 * Grabs all pending node manifests, processes them, writes them to disk,
 * and then removes them from the store.
 * Manifest files are added via the public unstable_createNodeManifest action in sourceNodes
 */
export async function processNodeManifests({ store, reporter }): Promise<void> {
  const { nodeManifests } = store.getState()

  const totalManifests = nodeManifests.length

  if (totalManifests === 0) {
    return
  }

  await Promise.all(
    nodeManifests.map(inputManifest =>
      processNodeManifest({ inputManifest, store, reporter })
    )
  )

  reporter.info(
    `Wrote out ${totalManifests} node page manifest file${
      totalManifests > 1 ? `s` : ``
    }`
  )

  // clean up all pending manifests from the store
  store.dispatch(internalActions.deleteNodeManifests())
}
