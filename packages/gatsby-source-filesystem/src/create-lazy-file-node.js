const path = require(`path`)

const mime = require(`mime`)
const {
  getRemoteFileExtension,
  getRemoteFileName,
  createFilePath,
} = require(`./utils`)

const { createContentDigest, slash } = require(`gatsby-core-utils`)
const CACHE_DIR = `.cache`
const FS_PLUGIN_DIR = `gatsby-source-filesystem`

function createFileNode(pathToFile, createNodeId, mimeType = null) {
  const cwd = process.cwd()
  const absolutePath = slash(pathToFile)
  const parsedSlashed = path.parse(absolutePath)
  const relativePath = slash(path.relative(cwd, absolutePath))
  const mediaType = mimeType ?? mime.getType(parsedSlashed.ext)
  const contentDigest = createContentDigest(pathToFile)

  const internal = {
    contentDigest,
    type: `RemoteFile`,
    mediaType: mediaType ?? `application/octet-stream`,
    description: `File "${relativePath}"`,
  }

  return {
    absolutePath,
    // Don't actually make the File id the absolute path as otherwise
    // people will use the id for that and ids shouldn't be treated as
    // useful information.
    ...parsedSlashed,
    id: createNodeId(pathToFile),
    relativeDirectory: slash(path.relative(cwd, parsedSlashed.dir)),
    relativePath,
    children: [],
    parent: null,
    internal,
    sourceInstanceName: `__PROGRAMMATIC__`,
  }
}

/***************
 * Entry Point *
 ***************/

/**
 * createLazyFileNode
 * --
 *
 * Create a wrapper for a lazy-loaded remote file
 *
 * @param {CreateRemoteFileNodePayload} options
 * @return {Promise<Object>} Returns the created node
 */

exports.createLazyFileNode = async ({
  url,
  store,
  cache,
  createNode,
  parentNodeId = null,
  createNodeId,
  ext = null,
  name = null,
  mediaType = null,
}) => {
  if (typeof createNodeId !== `function`) {
    throw new Error(
      `createNodeId must be a function, was ${typeof createNodeId}`
    )
  }

  if (typeof createNode !== `function`) {
    throw new Error(`createNode must be a function, was ${typeof createNode}`)
  }

  if (!store || typeof store !== `object`) {
    throw new Error(`store must be the redux store, was ${typeof store}`)
  }

  if (!cache || typeof cache !== `object`) {
    throw new Error(`cache must be the Gatsby cache, was ${typeof cache}`)
  }

  const pluginCacheDir = path.join(
    store.getState().program.directory,
    CACHE_DIR,
    FS_PLUGIN_DIR
  )

  const digest = createContentDigest(url)

  if (!name) {
    name = getRemoteFileName(url)
  }

  if (!ext) {
    ext = getRemoteFileExtension(url)
  }

  const filename = createFilePath(path.join(pluginCacheDir, digest), name, ext)

  const fileNode = createFileNode(filename, createNodeId, mediaType)
  fileNode.internal.description = `Remote File "${url}"`
  fileNode.url = url
  fileNode.parent = parentNodeId

  createNode(fileNode, {
    name: `gatsby-source-filesystem`,
  })
  return fileNode
}
