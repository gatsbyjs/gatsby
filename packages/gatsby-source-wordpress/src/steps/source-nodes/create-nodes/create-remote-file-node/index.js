import { b64e } from "~/utils/string-encoding"
import { withPluginKey } from "~/store"
const fs = require(`fs-extra`)
const { remoteFileDownloaderBarPromise } = require(`./progress-bar-promise`)
const got = require(`got`)
const { createContentDigest } = require(`gatsby-core-utils`)
const path = require(`path`)
const { isWebUri } = require(`valid-url`)
const Queue = require(`better-queue`)
const readChunk = require(`read-chunk`)
const fileType = require(`file-type`)

const { createFileNode } = require(`gatsby-source-filesystem/create-file-node`)
const {
  getRemoteFileExtension,
  getRemoteFileName,
  createFilePath,
} = require(`gatsby-source-filesystem/utils`)
const cacheId = url => withPluginKey(`create-remote-file-node-${url}`)

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
 * requestRemoteNode
 * --
 * Download the requested file
 *
 * @param  {String}   url
 * @param  {Headers}  headers
 * @param  {String}   tmpFilename
 * @param  {Object}   httpOpts
 * @param  {number}   attempt
 * @return {Promise<Object>}  Resolves with the [http Result Object]{@link https://nodejs.org/api/http.html#http_class_http_serverresponse}
 */
const requestRemoteNode = (url, headers, tmpFilename, httpOpts, attempt = 1) =>
  new Promise((resolve, reject) => {
    let timeout

    // Called if we stall without receiving any data
    const handleTimeout = async () => {
      fsWriteStream.close()
      fs.removeSync(tmpFilename)
      if (attempt < STALL_RETRY_LIMIT) {
        // Retry by calling ourself recursively
        resolve(
          requestRemoteNode(url, headers, tmpFilename, httpOpts, attempt + 1)
        )
      } else {
        processingCache[url] = null
        totalJobs -= 1
        bar.total = totalJobs
        reject(
          new Error(
            `Failed to download ${url} after ${STALL_RETRY_LIMIT} attempts`
          )
        )
      }
    }

    const resetTimeout = () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(handleTimeout, STALL_TIMEOUT)
    }

    const responseStream = got.stream(url, {
      headers,
      timeout: { send: CONNECTION_TIMEOUT },
      ...httpOpts,
    })
    const fsWriteStream = fs.createWriteStream(tmpFilename)
    responseStream.pipe(fsWriteStream)

    // If there's a 400/500 response or other error.
    responseStream.on(`error`, error => {
      if (timeout) {
        clearTimeout(timeout)
      }
      processingCache[url] = null
      totalJobs -= 1
      bar.total = totalJobs
      fs.removeSync(tmpFilename)
      console.error(error)
      reject(error)
    })

    fsWriteStream.on(`error`, error => {
      if (timeout) {
        clearTimeout(timeout)
      }
      processingCache[url] = null
      totalJobs -= 1
      bar.total = totalJobs
      reject(error)
    })

    responseStream.on(`response`, response => {
      resetTimeout()

      fsWriteStream.on(`finish`, () => {
        if (timeout) {
          clearTimeout(timeout)
        }
        resolve(response)
      })
    })
  })

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
  const pluginCacheDir = cache.directory
  // See if there's response headers for this url
  // from a previous request.
  const cachedHeaders = await cache.get(cacheId(url))

  const headers = { ...httpHeaders }
  if (cachedHeaders && cachedHeaders.etag) {
    headers[`If-None-Match`] = cachedHeaders.etag
  }

  // Add htaccess authentication if passed in. This isn't particularly
  // extensible. We should define a proper API that we validate.
  const httpOpts = {}
  if (auth?.htaccess_pass && auth?.htaccess_user) {
    headers[`Authorization`] = `Basic ${b64e(
      `${auth.htaccess_user}:${auth.htaccess_pass}`
    )}`
  }

  // Create the temp and permanent file names for the url.
  const digest = createContentDigest(url)
  if (!name) {
    name = getRemoteFileName(url)
  }
  if (!ext) {
    ext = getRemoteFileExtension(url)
  }

  const tmpFilename = createFilePath(pluginCacheDir, `tmp-${digest}`, ext)

  // Fetch the file.
  const response = await requestRemoteNode(url, headers, tmpFilename, httpOpts)

  if (response.statusCode == 200) {
    // Save the response headers for future requests.
    await cache.set(cacheId(url), response.headers)
  }

  // If the user did not provide an extension and we couldn't get one from remote file, try and guess one
  if (ext === ``) {
    const buffer = readChunk.sync(tmpFilename, 0, fileType.minimumBytes)
    const filetype = fileType(buffer)
    if (filetype) {
      ext = `.${filetype.ext}`
    }
  }

  const filename = createFilePath(
    path.join(pluginCacheDir, digest),
    String(name),
    ext
  )

  // If the status code is 200, move the piped temp file to the real name.
  if (response.statusCode === 200) {
    await fs.move(tmpFilename, filename, { overwrite: true })
    // Else if 304, remove the empty response.
  } else {
    processingCache[url] = null
    totalJobs -= 1

    bar.total = totalJobs

    await fs.remove(tmpFilename)
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
