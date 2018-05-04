const fs = require(`fs-extra`)
const got = require(`got`)
const crypto = require(`crypto`)
const path = require(`path`)
const { isWebUri } = require(`valid-url`)
const Queue = require(`better-queue`)

const { createFileNode } = require(`./create-file-node`)
const cacheId = url => `create-remote-file-node-${url}`

/********************
 * Type Definitions *
 ********************/

/**
 * @typedef {Redux}
 * @see [Redux Docs]{@link https://redux.js.org/api-reference}
 */

/**
 * @typedef {GatsbyCache}
 * @see gatsby/packages/gatsby/utils/cache.js
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
 * @param  {Redux} options.store
 * @param  {GatsbyCache} options.cache
 * @param  {Function} options.createNode
 * @param  {Auth} [options.auth]
 */

/*********
 * utils *
 *********/

/**
 * createHash
 * --
 *
 * Create an md5 hash of the given str
 * @param  {Stringq} str
 * @return {String}
 */
const createHash = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`)

const CACHE_DIR = `.cache`
const FS_PLUGIN_DIR = `gatsby-source-filesystem`

/**
 * createFilePath
 * --
 *
 * @param  {String} directory
 * @param  {String} filename
 * @param  {String} url
 * @return {String}
 */
const createFilePath = (directory, filename, ext) =>
  path.join(directory, CACHE_DIR, FS_PLUGIN_DIR, `${filename}${ext}`)

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
  concurrent: 200,
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
    return cb(null, e)
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
 * @param  {String}   filename
 * @return {Promise<Object>}  Resolves with the [http Result Object]{@link https://nodejs.org/api/http.html#http_class_http_serverresponse}
 */
const requestRemoteNode = (url, headers, tmpFilename, filename) =>
  new Promise((resolve, reject) => {
    const responseStream = got.stream(url, { ...headers, timeout: 30000 })
    const fsWriteStream = fs.createWriteStream(tmpFilename)
    responseStream.pipe(fsWriteStream)
    responseStream.on(`downloadProgress`, pro => console.log(pro))

    // If there's a 400/500 response or other error.
    responseStream.on(`error`, (error, body, response) => {
      fs.removeSync(tmpFilename)
      reject({ error, body, response })
    })

    responseStream.on(`response`, response => {
      fsWriteStream.on(`finish`, () => {
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
async function processRemoteNode({ url, store, cache, createNode, auth = {} }) {
  // Ensure our cache directory exists.
  const programDir = store.getState().program.directory
  await fs.ensureDir(path.join(programDir, CACHE_DIR, FS_PLUGIN_DIR))

  // See if there's response headers for this url
  // from a previous request.
  const cachedHeaders = await cache.get(cacheId(url))
  const headers = {}

  // Add htaccess authentication if passed in. This isn't particularly
  // extensible. We should define a proper API that we validate.
  if (auth && auth.htaccess_pass && auth.htaccess_user) {
    headers.auth = `${auth.htaccess_user}:${auth.htaccess_pass}`
  }

  if (cachedHeaders && cachedHeaders.etag) {
    headers[`If-None-Match`] = cachedHeaders.etag
  }

  // Create the temp and permanent file names for the url.
  const digest = createHash(url)
  const ext = path.parse(url).ext

  const tmpFilename = createFilePath(programDir, `tmp-${digest}`, ext)
  const filename = createFilePath(programDir, digest, ext)

  // Fetch the file.
  try {
    const response = await requestRemoteNode(
      url,
      headers,
      tmpFilename,
      filename
    )
    // Save the response headers for future requests.
    cache.set(cacheId(url), response.headers)

    // If the status code is 200, move the piped temp file to the real name.
    if (response.statusCode === 200) {
      await fs.move(tmpFilename, filename, { overwrite: true })
      // Else if 304, remove the empty response.
    } else {
      await fs.remove(tmpFilename)
    }

    // Create the file node.
    const fileNode = await createFileNode(filename, {})
    fileNode.internal.description = `File "${url}"`
    // Override the default plugin as gatsby-source-filesystem needs to
    // be the owner of File nodes or there'll be conflicts if any other
    // File nodes are created through normal usages of
    // gatsby-source-filesystem.
    createNode(fileNode, { name: `gatsby-source-filesystem` })

    return fileNode
  } catch (err) {
    // ignore
  }
  return null
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
      .on(`failed`, () => {
        resolve()
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
module.exports = ({ url, store, cache, createNode, auth = {} }) => {
  // Check if we already requested node for this remote file
  // and return stored promise if we did.
  if (processingCache[url]) {
    return processingCache[url]
  }

  if (!url || isWebUri(url) === undefined) {
    // should we resolve here, or reject?
    // Technically, it's invalid input
    return Promise.resolve()
  }

  return (processingCache[url] = pushTask({
    url,
    store,
    cache,
    createNode,
    auth,
  }))
}
