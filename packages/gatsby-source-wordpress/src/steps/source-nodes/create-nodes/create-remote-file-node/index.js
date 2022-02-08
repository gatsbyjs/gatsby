const fs = require(`fs-extra`)
import btoa from "btoa"
const { remoteFileDownloaderBarPromise } = require(`./progress-bar-promise`)
const got = require(`got`)
const { createContentDigest } = require(`gatsby-core-utils`)
const path = require(`path`)
const { isWebUri } = require(`valid-url`)
const Queue = require(`better-queue`)
const readChunk = require(`read-chunk`)
const fileType = require(`file-type`)
const { fetchRemoteFile } = require(`gatsby-core-utils/fetch-remote-file`)
const { createFileNode } = require(`gatsby-source-filesystem/create-file-node`)
const {
  getRemoteFileExtension,
  getRemoteFileName,
  createFilePath,
} = require(`gatsby-source-filesystem/utils`)
const cacheId = url => `create-remote-file-node-${url}`

let bar
// Keep track of the total number of jobs we push in the queue
let totalJobs = 0

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

const STALL_RETRY_LIMIT = process.env.GATSBY_STALL_RETRY_LIMIT
  ? parseInt(process.env.GATSBY_STALL_RETRY_LIMIT, 10)
  : 3
const STALL_TIMEOUT = process.env.GATSBY_STALL_TIMEOUT
  ? parseInt(process.env.GATSBY_STALL_TIMEOUT, 10)
  : 30000

const CONNECTION_TIMEOUT = process.env.GATSBY_CONNECTION_TIMEOUT
  ? parseInt(process.env.GATSBY_CONNECTION_TIMEOUT, 10)
  : 30000

/********************
 * Queue Management *
 ********************/

/**
 * Queue
 * Use the task's url as the id
 * When pushing a task with a similar id, prefer the original task
 * as it's already in the processing cache
 */

let queue = null

const getQueue = limit => {
  if (!queue) {
    queue = new Queue(pushToQueue, {
      id: `url`,
      merge: (old, _, cb) => cb(old),
      concurrent: limit || 100,
    })
    // when the queue is empty we stop the progressbar
    queue.on(`drain`, async () => {
      if (awaitingCreateRemoteFileNodePromise) {
        return
      }

      awaitingCreateRemoteFileNodePromise = true
      await remoteFileDownloaderBarPromise
      awaitingCreateRemoteFileNodePromise = false

      if (bar) {
        // this is to give us a little time to wait and see if there
        // will be more jobs added with a break between
        // sometimes the queue empties but then is recreated within 2 secs
        doneQueueTimeout = setTimeout(() => {
          bar.done()
          totalJobs = 0
        }, 2000)
      }
    })
  }
  return queue
}

let doneQueueTimeout

let awaitingCreateRemoteFileNodePromise

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
  const filename = await fetchRemoteFile({
    url,
    httpHeaders,
    auth,
    ext,
    name,
    directory: cache.directory,
  })

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
    getQueue(task.limit)
      .push(task)
      .on(`finish`, task => {
        resolve(task)
      })
      .on(`failed`, err => {
        reject(new Error(`failed to process ${task.url}\n${err}`))
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
module.exports = ({
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
  reporter,
  pluginOptions,
}) => {
  const limit = pluginOptions?.type?.MediaItem?.localFile?.requestConcurrency
  if (doneQueueTimeout) {
    // this is to give the bar a little time to wait when there are pauses
    // between file downloads.
    clearTimeout(doneQueueTimeout)
  }

  // if the url isn't already encoded
  // so decoding it doesn't do anything
  if (decodeURI(url) === url) {
    // encode the uri
    // this accounts for special characters in filenames
    url = encodeURI(url)
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
      new Error(
        `url passed to create-remote-file-node is either missing or not a proper web uri: ${url}`
      )
    )
  }

  if (totalJobs === 0) {
    bar = reporter.createProgress(`Downloading remote files`)
    bar.start()
  }

  totalJobs += 1

  bar.total = totalJobs

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
    limit,
  })

  processingCache[url] = fileDownloadPromise.then(node => {
    bar.tick()

    return node
  })

  return processingCache[url]
}
