import * as fs from "fs-extra"
import * as path from "path"
import got from "got"
import { isWebUri } from "valid-url"
import Queue from "better-queue"
import readChunk from "read-chunk"
import fileType from "file-type"
import { createContentDigest } from "gatsby-core-utils"
import {
  createProgress,
  getRemoteFileExtension,
  getRemoteFileName,
  createFilePath,
  IProgressReport,
} from "./utils"
import { createFileNode } from "./create-file-node"
import { IFileSystemNode, ICreateRemoteFileNodeArgs } from "../"

interface IHTTPOptions {
  auth?: string
}

const cacheId = (url: string): string => `create-remote-file-node-${url}`

let bar: IProgressReport | undefined
// Keep track of the total number of jobs we push in the queue
let totalJobs = 0

const STALL_RETRY_LIMIT = 3
const STALL_TIMEOUT = 30000

const CONNECTION_RETRY_LIMIT = 5
const CONNECTION_TIMEOUT = 30000

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
  merge: (old, _, cb): void => cb(old, _),
  concurrent: (process.env.GATSBY_CONCURRENT_DOWNLOAD || 200) as number,
})

// when the queue is empty we stop the progressbar
queue.on(`drain`, () => {
  if (bar) {
    bar.done()
  }
  totalJobs = 0
})

/**
 * Handle tasks that are pushed in to the Queue
 */
async function pushToQueue<T>(
  task: ICreateRemoteFileNodeArgs & { parentNodeId: string },
  cb: (err: string | null, node?: IFileSystemNode) => T
): Promise<T> {
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
 * Download the requested file
 * Resolves with the [http Result Object]{@link https://nodejs.org/api/http.html#http_class_http_serverresponse}
 */
function requestRemoteNode(
  url: string,
  headers: { [key: string]: string },
  tmpFilename: string,
  httpOpts?: IHTTPOptions,
  attempt = 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  return new Promise((resolve, reject) => {
    let timeout

    // Called if we stall for 30s without receiving any data
    const handleTimeout = async (): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
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

    const resetTimeout = (): void => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(handleTimeout, STALL_TIMEOUT)
    }
    const responseStream = got.stream(url, {
      headers,
      timeout: CONNECTION_TIMEOUT,
      retry: {
        retries: CONNECTION_RETRY_LIMIT,
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

      fsWriteStream.on(`finish`, () => {
        if (timeout) {
          clearTimeout(timeout)
        }
        resolve(response)
      })
    })
  })
}

/**
 * Request the remote file and return the fileNode
 */
async function processRemoteNode({
  url,
  cache,
  createNode,
  parentNodeId,
  auth,
  httpHeaders = {},
  createNodeId,
  ext,
  name,
}: ICreateRemoteFileNodeArgs & { parentNodeId: string }): Promise<
  IFileSystemNode
> {
  const pluginCacheDir = cache.directory
  // See if there's response headers for this url
  // from a previous request.
  const cachedHeaders = (await cache.get(cacheId(url))) as {
    etag?: string
  }

  const headers = { ...httpHeaders }
  if (cachedHeaders && cachedHeaders.etag) {
    headers[`If-None-Match`] = cachedHeaders.etag
  }

  // Add htaccess authentication if passed in. This isn't particularly
  // extensible. We should define a proper API that we validate.
  const httpOpts = {} as IHTTPOptions
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

  const filename = createFilePath(path.join(pluginCacheDir, digest), name, ext)
  // If the status code is 200, move the piped temp file to the real name.
  if (response.statusCode === 200) {
    await fs.move(tmpFilename, filename, { overwrite: true })
    // Else if 304, remove the empty response.
  } else {
    await fs.remove(tmpFilename)
  }

  // Create the file node.
  const fileNode = await createFileNode(filename, createNodeId, {})
  fileNode.internal.description = `File "${url}"`
  fileNode.url = url
  fileNode.parent = parentNodeId as string
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
 * pushes a task in to the Queue and the processing cache
 */
const pushTask = (
  task: ICreateRemoteFileNodeArgs
): Promise<ICreateRemoteFileNodeArgs> =>
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

/**
 * Download a remote file
 * First checks cache to ensure duplicate requests aren't processed
 * Then pushes to a queue
 */
export async function createRemoteFileNode({
  url,
  cache,
  createNode,
  getCache,
  parentNodeId,
  auth = {},
  httpHeaders = {},
  createNodeId,
  ext,
  name,
  reporter,
}: ICreateRemoteFileNodeArgs): Promise<IFileSystemNode> {
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
    return Promise.reject(`wrong url: ${url}`)
  }

  if (totalJobs === 0) {
    bar = createProgress(`Downloading remote files`, reporter)
    bar.start()
  }

  totalJobs += 1
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  bar!.total = totalJobs

  const fileDownloadPromise = pushTask({
    url,
    cache,
    createNode,
    getCache,
    parentNodeId,
    createNodeId,
    auth,
    httpHeaders,
    ext,
    name,
    reporter,
  })

  processingCache[url] = fileDownloadPromise.then(node => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bar!.tick()

    return node
  })

  return processingCache[url]
}
