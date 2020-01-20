"use strict"

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

function createFileNode(pathToFile, createNodeId, pluginOptions = {}) {
  const slashed = slash(pathToFile)
  const parsedSlashed = path.parse(slashed)
  const slashedFile = Object.assign({}, parsedSlashed, {
    absolutePath: slashed,
    // Useful for limiting graphql query with certain parent directory
    relativeDirectory: slash(
      path.relative(pluginOptions.path || process.cwd(), parsedSlashed.dir)
    ),
  })
  let internal

  const mediaType = mime.getType(slashedFile.ext)
  const contentDigest = createContentDigest(pathToFile)
  internal = {
    contentDigest,
    type: `RemoteFile`,
    mediaType: mediaType ? mediaType : `application/octet-stream`,
    description: `File "${path.relative(process.cwd(), slashed)}"`,
  }

  return JSON.parse(
    JSON.stringify(
      Object.assign(
        {
          // Don't actually make the File id the absolute path as otherwise
          // people will use the id for that and ids shouldn't be treated as
          // useful information.
          id: createNodeId(pathToFile),
          children: [],
          parent: null,
          internal,
          sourceInstanceName: pluginOptions.name || `__PROGRAMMATIC__`,
          absolutePath: slashedFile.absolutePath,
          relativePath: slash(
            path.relative(
              pluginOptions.path || process.cwd(),
              slashedFile.absolutePath
            )
          ),
          // extension: slashedFile.ext.slice(1).toLowerCase(),
        },
        slashedFile,
        {}
      )
    )
  )
}

/***************
 * Entry Point *
 ***************/

/**
 * createRemoteFileNode
 * --
 *
 * Download a remote file
 * First checks cache to ensure duplicate requests aren't processed
 * Then pushes to a queue
 *
 * @param {CreateRemoteFileNodePayload} options
 * @return {Promise<Object>}                  Returns the created node
 */

module.exports.createLazyFileNode = async ({
  url,
  store,
  cache,
  createNode,
  parentNodeId = null,
  auth = {},
  httpHeaders = {},
  createNodeId,
  ext = null,
  name = null,
  reporter,
}) => {
  if (typeof createNodeId !== `function`) {
    throw new Error(
      `createNodeId must be a function, was ${typeof createNodeId}`
    )
  }

  if (typeof createNode !== `function`) {
    throw new Error(`createNode must be a function, was ${typeof createNode}`)
  }

  if (typeof store !== `object`) {
    throw new Error(`store must be the redux store, was ${typeof store}`)
  }

  if (typeof cache !== `object`) {
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

  const fileNode = createFileNode(filename, createNodeId, {})
  fileNode.internal.description = `Remote File "${url}"`
  fileNode.url = url
  fileNode.parent = parentNodeId

  // Override the default plugin as gatsby-source-filesystem needs to
  // be the owner of File nodes or there'll be conflicts if any other
  // File nodes are created through normal usages of
  // gatsby-source-filesystem.
  createNode(fileNode, {
    name: `gatsby-source-filesystem`,
  })
  return fileNode
}
