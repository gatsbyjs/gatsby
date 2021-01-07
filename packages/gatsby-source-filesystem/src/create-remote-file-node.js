const fs = require(`fs-extra`)
const got = require(`got`)
const { createContentDigest } = require(`gatsby-core-utils`)
const path = require(`path`)
const { isWebUri } = require(`valid-url`)
const Queue = require(`better-queue`)
const fileType = require(`file-type`)
const { createProgress } = require(`./utils`)

const { createFileNode } = require(`./create-file-node`)
const {
  getRemoteFileExtension,
  getRemoteFileName,
  createFilePath,
} = require(`./utils`)
const cacheIdForHeaders = url => `create-remote-file-node-headers-${url}`
const cacheIdForExtensions = url => `create-remote-file-node-extension-${url}`

let bar
// Keep track of the total number of jobs we push in the queue
let totalJobs = 0

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

const STALL_RETRY_LIMIT = process.env.GATSBY_STALL_RETRY_LIMIT || 3
const STALL_TIMEOUT = process.env.GATSBY_STALL_TIMEOUT || 30000

const CONNECTION_TIMEOUT = process.env.GATSBY_CONNECTION_TIMEOUT || 30000

const INCOMPLETE_RETRY_LIMIT = process.env.GATSBY_INCOMPLETE_RETRY_LIMIT || 3

/********************
 * Queue Management *
 ********************/

/**
 * Queue
 * Use the task's url as the id
 * When pushing a task with a similar id, prefer the original task
 * as it's already in the processing cache
 */
const queue = new Queue(pushToQueue, {
  id: `url`,
  merge: (old, _, cb) => cb(old),
  concurrent: process.env.GATSBY_CONCURRENT_DOWNLOAD || 200,
})

// when the queue is empty we stop the progressbar
queue.on(`drain`, () => {
  if (bar) {
    bar.done()
  }
  totalJobs = 0
})

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

    // Called if we stall for 30s without receiving any data
    const handleTimeout = async () => {
      fsWriteStream.close()
      fs.removeSync(tmpFilename)
      if (attempt < STALL_RETRY_LIMIT) {
        // Retry by calling ourself recursively
        resolve(
          requestRemoteNode(url, headers, tmpFilename, httpOpts, attempt + 1)
        )
      } else {
        reject(`Failed to download ${url} after ${STALL_RETRY_LIMIT} attempts`)
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
      timeout: {
        send: CONNECTION_TIMEOUT, // https://github.com/sindresorhus/got#timeout
      },
      ...httpOpts,
    })
    const fsWriteStream = fs.createWriteStream(tmpFilename)
    responseStream.pipe(fsWriteStream)

    // If there's a 400/500 response or other error.
    responseStream.on(`error`, error => {
      if (timeout) {
        clearTimeout(timeout)
      }
      fs.removeSync(tmpFilename)
      reject(error)
    })

    fsWriteStream.on(`error`, error => {
      if (timeout) {
        clearTimeout(timeout)
      }
      reject(error)
    })

    responseStream.on(`response`, response => {
      resetTimeout()
      const contentLength =
        response.headers && Number(response.headers[`content-length`])

      fsWriteStream.on(`finish`, () => {
        // We have an incomplete download
        if (contentLength && contentLength !== fsWriteStream.bytesWritten) {
          fs.removeSync(tmpFilename)

          if (attempt < INCOMPLETE_RETRY_LIMIT) {
            resolve(
              requestRemoteNode(
                url,
                headers,
                tmpFilename,
                httpOpts,
                attempt + 1
              )
            )
          } else {
            reject(
              `Failed to download ${url} after ${INCOMPLETE_RETRY_LIMIT} attempts`
            )
          }
        }

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
    filename = await fetchRemoteNode({
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

async function fetchRemoteNode({
  url,
  cache,
  auth = {},
  httpHeaders = {},
  ext,
  name,
}) {
  const pluginCacheDir = cache.directory
  // See if there's response headers for this url
  // from a previous request.
  const cachedHeaders = await cache.get(cacheIdForHeaders(url))

  const headers = { ...httpHeaders }
  if (cachedHeaders && cachedHeaders.etag) {
    headers[`If-None-Match`] = cachedHeaders.etag
  }

  // Add htaccess authentication if passed in. This isn't particularly
  // extensible. We should define a proper API that we validate.
  const httpOpts = {}
  if (auth && (auth.htaccess_pass || auth.htaccess_user)) {
    httpOpts.auth = `${auth.htaccess_user}:${auth.htaccess_pass}`
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

  if (response.statusCode === 200) {
    // Save the response headers for future requests.
    await cache.set(cacheIdForHeaders(url), response.headers)
  }

  // If the user did not provide an extension and we couldn't get one from remote file, try and guess one
  if (ext === ``) {
    if (response.statusCode === 200) {
      // if this is fresh response - try to guess extension and cache result for future
      const filetype = await fileType.fromFile(tmpFilename)
      if (filetype) {
        ext = `.${filetype.ext}`
        await cache.set(cacheIdForExtensions(url), ext)
      }
    } else if (response.statusCode === 304) {
      // if file on server didn't change - grab cached extension
      ext = await cache.get(cacheIdForExtensions(url))
    }
  }

  const filename = createFilePath(path.join(pluginCacheDir, digest), name, ext)
  // If the status code is 200, move the piped temp file to the real name.
  if (response.statusCode === 200) {
    await fs.move(tmpFilename, filename, { overwrite: true })
    // Else if 304, remove the empty response.
  } else {
    await fs.remove(tmpFilename)
  }

  return filename
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
    queue
      .push(task)
      .on(`finish`, task => {
        resolve(task)
      })
      .on(`failed`, err => {
        reject(`failed to process ${task.url}\n${err}`)
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
  reporter,
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

  if (totalJobs === 0) {
    bar = createProgress(`Downloading remote files`, reporter)
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
  })

  processingCache[url] = fileDownloadPromise.then(node => {
    bar.tick()

    return node
  })

  return processingCache[url]
}
