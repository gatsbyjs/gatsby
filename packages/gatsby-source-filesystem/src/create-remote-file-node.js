const fs = require(`fs-extra`)
const { createContentDigest, fetchRemoteFile } = require(`gatsby-core-utils`)
const path = require(`path`)
const { isWebUri } = require(`valid-url`)
const Queue = require(`fastq`)
const { createFileNode } = require(`./create-file-node`)
const { getRemoteFileExtension, createFilePath } = require(`./utils`)

let showFlagWarning = !!process.env.GATSBY_EXPERIMENTAL_REMOTE_FILE_PLACEHOLDER

/********************
 * Type Definitions *
 ********************/

/**
 * @typedef {GatsbyCache}
 * @see gatsby/packages/gatsby/utils/cache.js
 */

/**
 * @typedef {Reporter}
 * @see gatsby/packages/gatsby-cli/lib/reporter.js
 */

/**
 * @typedef {Auth}
 * @type {Object}
 * @property {String} htaccess_pass
 * @property {String} htaccess_user
 */

/**
 * @typedef {CreateRemoteFileNodePayload}
 * @typedef {Object}
 * @description Create Remote File Node Payload
 *
 * @param  {String} options.url
 * @param  {GatsbyCache} options.cache
 * @param  {Function} options.createNode
 * @param  {Function} options.getCache
 * @param  {Auth} [options.auth]
 * @param  {Reporter} [options.reporter]
 */

/********************
 * Queue Management *
 ********************/

const GATSBY_CONCURRENT_DOWNLOAD = process.env.GATSBY_CONCURRENT_DOWNLOAD
  ? parseInt(process.env.GATSBY_CONCURRENT_DOWNLOAD, 10) || 0
  : 200

const queue = Queue(pushToQueue, GATSBY_CONCURRENT_DOWNLOAD)

/**
 * @callback {Queue~queueCallback}
 * @param {*} error
 * @param {*} result
 */

/**
 * pushToQueue
 * --
 * Handle tasks that are pushed in to the Queue
 *
 *
 * @param  {CreateRemoteFileNodePayload}          task
 * @param  {Queue~queueCallback}  cb
 * @return {Promise<null>}
 */
async function pushToQueue(task, cb) {
  try {
    const node = await processRemoteNode(task)
    return cb(null, node)
  } catch (e) {
    return cb(e)
  }
}

/******************
 * Core Functions *
 ******************/

/**
 * processRemoteNode
 * --
 * Request the remote file and return the fileNode
 *
 * @param {CreateRemoteFileNodePayload} options
 * @return {Promise<Object>} Resolves with the fileNode
 */
async function processRemoteNode({
  url,
  cache,
  createNode,
  parentNodeId,
  auth = {},
  httpHeaders = {},
  createNodeId,
  ext,
  name,
}) {
  let filename
  if (process.env.GATSBY_EXPERIMENTAL_REMOTE_FILE_PLACEHOLDER) {
    filename = await fetchPlaceholder({
      fromPath: process.env.GATSBY_EXPERIMENTAL_REMOTE_FILE_PLACEHOLDER,
      url,
      cache,
      ext,
      name,
    })
  } else {
    filename = await fetchRemoteFile({
      url,
      cache,
      auth,
      httpHeaders,
      ext,
      name,
    })
  }

  // Create the file node.
  const fileNode = await createFileNode(filename, createNodeId, {})
  fileNode.internal.description = `File "${url}"`
  fileNode.url = url
  fileNode.parent = parentNodeId
  // Override the default plugin as gatsby-source-filesystem needs to
  // be the owner of File nodes or there'll be conflicts if any other
  // File nodes are created through normal usages of
  // gatsby-source-filesystem.
  await createNode(fileNode, { name: `gatsby-source-filesystem` })

  return fileNode
}

async function fetchPlaceholder({ fromPath, url, cache, ext, name }) {
  const pluginCacheDir = cache.directory
  const digest = createContentDigest(url)

  if (!ext) {
    ext = getRemoteFileExtension(url)
  }

  const filename = createFilePath(path.join(pluginCacheDir, digest), name, ext)
  fs.copySync(fromPath, filename)
  return filename
}

/**
 * Index of promises resolving to File node from remote url
 */
const processingCache = {}
/**
 * pushTask
 * --
 * pushes a task in to the Queue and the processing cache
 *
 * Promisfy a task in queue
 * @param {CreateRemoteFileNodePayload} task
 * @return {Promise<Object>}
 */
const pushTask = task =>
  new Promise((resolve, reject) => {
    queue.push(task, (err, node) => {
      if (!err) {
        resolve(node)
      } else {
        reject(`failed to process ${task.url}\n${err}`)
      }
    })
  })

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
module.exports = function createRemoteFileNode({
  url,
  cache,
  createNode,
  getCache,
  parentNodeId = null,
  auth = {},
  httpHeaders = {},
  createNodeId,
  ext = null,
  name = null,
}) {
  if (showFlagWarning) {
    showFlagWarning = false
    // Note: This will use a placeholder image as the default for every file that is downloaded through this API.
    //       That may break certain cases, in particular when the file is not meant to be an image or when the image
    //       is expected to be of a particular type that is other than the placeholder. This API is meant to bypass
    //       the remote download for local testing only.
    console.info(
      `GATSBY_EXPERIMENTAL_REMOTE_FILE_PLACEHOLDER: Any file downloaded by \`createRemoteFileNode\` will use the same placeholder image and skip the remote fetch. Note: This is an experimental flag that can change/disappear at any point.`
    )
    console.info(
      `GATSBY_EXPERIMENTAL_REMOTE_FILE_PLACEHOLDER: File to use: \`${process.env.GATSBY_EXPERIMENTAL_REMOTE_FILE_PLACEHOLDER}\``
    )
  }

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

  // Check if we already requested node for this remote file
  // and return stored promise if we did.
  if (processingCache[url]) {
    return processingCache[url]
  }

  if (!url || isWebUri(url) === undefined) {
    return Promise.reject(
      `url passed to createRemoteFileNode is either missing or not a proper web uri: ${url}`
    )
  }

  const fileDownloadPromise = pushTask({
    url,
    cache,
    createNode,
    parentNodeId,
    createNodeId,
    auth,
    httpHeaders,
    ext,
    name,
  })

  processingCache[url] = fileDownloadPromise.then(node => node)

  return processingCache[url]
}
