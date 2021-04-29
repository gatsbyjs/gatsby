import { internalActions } from "../redux/actions"
import path from "path"
import fs from "fs-extra"

interface INodeManifestPage {
  path?: string
}

interface INodeManifestIn {
  manifestId: string
  pluginName: string
  node: {
    id: string
  }
}

interface INodeManifestOut {
  page: INodeManifestPage
  node: {
    id: string
  }
}

async function findPageCreatedFromNodeId({
  nodeId,
  store,
}: {
  nodeId: string
  store: any
}): Promise<INodeManifestPage> {
  // @todo queries.byNode doesn't seem to update
  // when brand new pages are added while the process is running
  const pagesBynode = store.getState().queries.byNode
  const pagePathSet = pagesBynode.get(nodeId)
  const pagePath = pagePathSet?.values()?.next()?.value

  console.log({ pagesBynode, pagePathSet, pagePath })

  // @todo if we didn't find a node that a page queries directly
  // we should find a page where this node is queried as a connection
  // and return that instead

  return {
    path: pagePath || null,
  }
}

async function writeNodeManifest({
  inputManifest,
  store,
  reporter,
}: {
  inputManifest: INodeManifestIn
  store: any
  reporter: any
}): Promise<void> {
  // map the node to a page that was created
  const nodeManifestPage = await findPageCreatedFromNodeId({
    nodeId: inputManifest.node.id,
    store,
  })

  if (!nodeManifestPage) {
    reporter.warn(
      `Plugin ${inputManifest.pluginName} called createNodeManifest for node id ${inputManifest.node.id} with a manifest id of ${inputManifest.manifestId} but your Gatsby site didn't create a page for this node.`
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

export async function processNodeManifests({ store, reporter }): Promise<void> {
  const { nodeManifests } = store.getState()

  const totalManifests = nodeManifests.length

  if (totalManifests === 0) {
    return
  }

  await Promise.all(
    nodeManifests.map(inputManifest =>
      writeNodeManifest({ inputManifest, store, reporter })
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
