import * as fs from "fs-extra"
import * as path from "path"
import fileType from "file-type"
import { createContentDigest } from "gatsby-core-utils"
import { createFileNode } from "./create-file-node"
import { createFilePath } from "./utils"
import { IFileSystemNode, ICreateFileNodeFromBufferArgs } from "../"

const cacheId = (hash: string): string => `create-file-node-from-buffer-${hash}`

/**
 * Write the contents of `buffer` to `filename`
 */
const writeBuffer = (filename: string, buffer: Buffer): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.writeFile(filename, buffer, err => (err ? reject(err) : resolve()))
  })

/**
 * Write the buffer contents out to disk and return the fileNode
 */
async function processBufferNode({
  buffer,
  hash,
  cache,
  createNode,
  parentNodeId,
  createNodeId,
  ext,
  name,
}: ICreateFileNodeFromBufferArgs & { hash: string; name: string }): Promise<
  IFileSystemNode
> {
  const pluginCacheDir = cache.directory

  // See if there's a cache file for this buffer's contents from
  // a previous run
  let filename = await cache.get(cacheId(hash))
  if (!filename) {
    // If the user did not provide an extension and we couldn't get
    // one from remote file, try and guess one
    if (typeof ext === `undefined`) {
      const filetype = fileType(buffer)
      ext = filetype ? `.${filetype.ext}` : `.bin`
    }

    await fs.ensureDir(path.join(pluginCacheDir, hash))
    filename = createFilePath(path.join(pluginCacheDir, hash), name, ext)

    // Cache the buffer contents
    await writeBuffer(filename as string, buffer)

    // Save the cache file path for future use
    await cache.set(cacheId(hash), filename)
  }

  // Create the file node.
  const fileNode = await createFileNode(filename as string, createNodeId, {})
  fileNode.internal.description = `File "Buffer<${hash}>"`
  fileNode.hash = hash
  fileNode.parent = parentNodeId as string
  // Override the default plugin as gatsby-source-filesystem needs to
  // be the owner of File nodes or there'll be conflicts if any other
  // File nodes are created through normal usages of
  // gatsby-source-filesystem.
  await createNode(fileNode, { name: `gatsby-source-filesystem` })

  return fileNode
}

/**
 * Index of promises resolving to File node from buffer cache
 */
const processingCache = {}

/**
 * Cache a buffer's contents to disk
 * First checks cache to ensure duplicate buffers aren't processed
 */
export function createFileNodeFromBuffer({
  buffer,
  hash,
  cache,
  createNode,
  getCache,
  parentNodeId,
  createNodeId,
  ext,
  name = hash,
}: ICreateFileNodeFromBufferArgs): Promise<IFileSystemNode> {
  // validation of the input
  // without this it's notoriously easy to pass in the wrong `createNodeId`
  // see gatsbyjs/gatsby#6643
  if (typeof createNodeId !== `function`) {
    throw new Error(
      `createNodeId must be a function, was ${typeof createNodeId}`
    )
  }
  if (typeof createNode !== `function`) {
    throw new Error(`createNode must be a function, was ${typeof createNode}`)
  }
  if (typeof getCache === `function`) {
    // use cache of this plugin and not cache of function caller
    cache = getCache(`gatsby-source-filesystem`)
  }
  if (typeof cache !== `object`) {
    throw new Error(
      `Neither "cache" or "getCache" was passed. getCache must be function that return Gatsby cache, "cache" must be the Gatsby cache, was ${typeof cache}`
    )
  }

  if (!buffer) {
    return Promise.reject(`bad buffer: ${buffer}`)
  }

  if (!hash) {
    hash = createContentDigest(buffer)
  }

  // Check if we already requested node for this remote file
  // and return stored promise if we did.
  if (processingCache[hash]) {
    return processingCache[hash]
  }

  const bufferCachePromise = processBufferNode({
    buffer,
    hash: hash as string,
    cache,
    getCache,
    createNode,
    parentNodeId,
    createNodeId,
    ext,
    name: name as string,
  })

  processingCache[hash] = bufferCachePromise

  return processingCache[hash]
}
