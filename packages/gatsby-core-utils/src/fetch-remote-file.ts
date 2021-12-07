import got, { Headers, Options, RequestError } from "got"
import fileType from "file-type"
import path from "path"
import fs from "fs-extra"
import { createContentDigest } from "./create-content-digest"
import {
  getRemoteFileName,
  getRemoteFileExtension,
  createFilePath,
} from "./filename-utils"
import type { IncomingMessage } from "http"
import type { GatsbyCache } from "gatsby"

export interface IFetchRemoteFileOptions {
  url: string
  cache: GatsbyCache
  auth?: {
    htaccess_pass?: string
    htaccess_user?: string
  }
  httpHeaders?: Headers
  ext?: string
  name?: string
  maxAttempts?: number
}

// copied from gatsby-worker
const IS_WORKER = !!(process.send && process.env.GATSBY_WORKER_MODULE_PATH)
const WORKER_ID = process.env.GATSBY_WORKER_ID

const cacheIdForWorkers = (url: string): string => `remote-file-workers-${url}`
const cacheIdForHeaders = (url: string): string => `remote-file-headers-${url}`
const cacheIdForExtensions = (url: string): string =>
  `remote-file-extension-${url}`

const STALL_RETRY_LIMIT = process.env.GATSBY_STALL_RETRY_LIMIT
  ? parseInt(process.env.GATSBY_STALL_RETRY_LIMIT, 10)
  : 3
const STALL_TIMEOUT = process.env.GATSBY_STALL_TIMEOUT
  ? parseInt(process.env.GATSBY_STALL_TIMEOUT, 10)
  : 30000

const CONNECTION_TIMEOUT = process.env.GATSBY_CONNECTION_TIMEOUT
  ? parseInt(process.env.GATSBY_CONNECTION_TIMEOUT, 10)
  : 30000

const INCOMPLETE_RETRY_LIMIT = process.env.GATSBY_INCOMPLETE_RETRY_LIMIT
  ? parseInt(process.env.GATSBY_INCOMPLETE_RETRY_LIMIT, 10)
  : 3

// jest doesn't allow us to run all timings infinitely, so we set it 0  in tests
const BACKOFF_TIME = process.env.NODE_ENV === `test` ? 0 : 1000

function range(start: number, end: number): Array<number> {
  return Array(end - start)
    .fill(null)
    .map((_, i) => start + i)
}

// Based on the defaults of https://github.com/JustinBeckwith/retry-axios
const STATUS_CODES_TO_RETRY = [...range(100, 200), 429, ...range(500, 600)]
const ERROR_CODES_TO_RETRY = [
  `ETIMEDOUT`,
  `ECONNRESET`,
  `EADDRINUSE`,
  `ECONNREFUSED`,
  `EPIPE`,
  `ENOTFOUND`,
  `ENETUNREACH`,
  `EAI_AGAIN`,
  `ERR_NON_2XX_3XX_RESPONSE`,
  `ERR_GOT_REQUEST_ERROR`,
]

let fetchCache = new Map()
let latestBuildId = ``

export async function fetchRemoteFile(
  args: IFetchRemoteFileOptions
): Promise<string> {
  const BUILD_ID = global.__GATSBY?.buildId ?? ``
  if (BUILD_ID !== latestBuildId) {
    latestBuildId = BUILD_ID
    fetchCache = new Map()
  }

  // If we are already fetching the file, return the unresolved promise
  const inFlight = fetchCache.get(args.url)
  if (inFlight) {
    return inFlight
  }

  // Create file fetch promise and store it into cache
  const fetchPromise = fetchFile(args)
  fetchCache.set(args.url, fetchPromise)

  return fetchPromise.catch(err => {
    fetchCache.delete(args.url)

    throw err
  })
}

function pollUntilComplete(
  cache: GatsbyCache,
  url: string,
  buildId: string,
  cb: (err?: Error, result?: string) => void
): void {
  cache.get(cacheIdForWorkers(url)).then(entry => {
    if (!entry || entry.buildId !== buildId) {
      return void cb()
    }

    if (entry.status === `complete`) {
      cb(undefined, entry.result)
    } else if (entry.status === `failed`) {
      cb(new Error(entry.result))
    } else {
      setTimeout(() => {
        pollUntilComplete(cache, url, buildId, cb)
        // Magic number
      }, 500)
    }

    return undefined
  })

  return undefined
}

// TODO Add proper mutex instead of file cache hacks
async function fetchFile({
  url,
  cache,
  auth = {},
  httpHeaders = {},
  ext,
  name,
}: IFetchRemoteFileOptions): Promise<string> {
  // global introduced in gatsby 4.0.0
  const BUILD_ID = global.__GATSBY?.buildId ?? ``
  const pluginCacheDir = cache.directory

  // when a cache entry is present we wait until it completes
  const result = await new Promise<string | undefined>((resolve, reject) => {
    pollUntilComplete(cache, url, BUILD_ID, (err, result) => {
      if (err) {
        return reject(err)
      }

      return resolve(result)
    })
  })

  if (result) {
    return result
  }

  await cache.set(cacheIdForWorkers(url), {
    status: `pending`,
    result: null,
    workerId: WORKER_ID,
    buildId: BUILD_ID,
  })

  // See if there's response headers for this url
  // from a previous request.
  const { headers: cachedHeaders, digest: originalDigest } =
    (await cache.get(cacheIdForHeaders(url))) ?? {}
  const headers = { ...httpHeaders }
  if (cachedHeaders && cachedHeaders.etag) {
    headers[`If-None-Match`] = cachedHeaders.etag
  }

  // Add htaccess authentication if passed in. This isn't particularly
  // extensible. We should define a proper API that we validate.
  const httpOptions: Options = {}
  if (auth && (auth.htaccess_pass || auth.htaccess_user)) {
    httpOptions.username = auth.htaccess_user
    httpOptions.password = auth.htaccess_pass
  }

  // Create the temp and permanent file names for the url.
  let digest = createContentDigest(url)

  // if worker id is present - we also append the worker id until we have a proper mutex
  if (IS_WORKER) {
    digest += `-${WORKER_ID}`
  }

  if (!name) {
    name = getRemoteFileName(url)
  }
  if (!ext) {
    ext = getRemoteFileExtension(url)
  }

  const tmpFilename = createFilePath(pluginCacheDir, `tmp-${digest}`, ext)

  // Fetch the file.
  try {
    const response = await requestRemoteNode(
      url,
      headers,
      tmpFilename,
      httpOptions
    )

    if (response.statusCode === 200) {
      // Save the response headers for future requests.
      await cache.set(cacheIdForHeaders(url), {
        headers: response.headers,
        digest,
      })

      // If the user did not provide an extension and we couldn't get one from remote file, try and guess one
      if (!ext) {
        // if this is fresh response - try to guess extension and cache result for future
        const filetype = await fileType.fromFile(tmpFilename)
        if (filetype) {
          ext = `.${filetype.ext}`
          await cache.set(cacheIdForExtensions(url), ext)
        }
      }
    } else if (response.statusCode === 304) {
      if (!ext) {
        ext = await cache.get(cacheIdForExtensions(url))
      }
    }

    // Multiple processes have started the fetch and we need another check to only let one complete
    const cacheEntry = await cache.get(cacheIdForWorkers(url))
    if (cacheEntry && cacheEntry.workerId !== WORKER_ID) {
      return new Promise<string>((resolve, reject) => {
        pollUntilComplete(cache, url, BUILD_ID, (err, result) => {
          if (err) {
            return reject(err)
          }

          return resolve(result as string)
        })
      })
    }

    // If the status code is 200, move the piped temp file to the real name.
    const filename = createFilePath(
      path.join(pluginCacheDir, originalDigest ?? digest),
      name,
      ext as string
    )

    if (response.statusCode === 200) {
      await fs.move(tmpFilename, filename, { overwrite: true })
      // Else if 304, remove the empty response.
    } else {
      await fs.remove(tmpFilename)
    }

    await cache.set(cacheIdForWorkers(url), {
      status: `complete`,
      result: filename,
      workerId: WORKER_ID,
      buildId: BUILD_ID,
    })

    return filename
  } catch (err) {
    // enable multiple processes to continue when done
    const cacheEntry = await cache.get(cacheIdForWorkers(url))

    if (!cacheEntry || cacheEntry.workerId === WORKER_ID) {
      await cache.set(cacheIdForWorkers(url), {
        status: `failed`,
        result: err.toString ? err.toString() : err.message ? err.message : err,
        workerId: WORKER_ID,
        buildId: BUILD_ID,
      })
    }

    throw err
  }
}

/**
 * requestRemoteNode
 * --
 * Download the requested file
 *
 * @param  {String}   url
 * @param  {Headers}  headers
 * @param  {String}   tmpFilename
 * @param  {Object}   httpOptions
 * @param  {number}   attempt
 * @return {Promise<Object>}  Resolves with the [http Result Object]{@link https://nodejs.org/api/http.html#http_class_http_serverresponse}
 */
function requestRemoteNode(
  url: string | URL,
  headers: Headers,
  tmpFilename: string,
  httpOptions?: Options,
  attempt: number = 1
): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout
    const fsWriteStream = fs.createWriteStream(tmpFilename)
    fsWriteStream.on(`error`, (error: unknown) => {
      if (timeout) {
        clearTimeout(timeout)
      }

      reject(error)
    })

    // Called if we stall for 30s without receiving any data
    const handleTimeout = async (): Promise<void> => {
      fsWriteStream.close()
      fs.removeSync(tmpFilename)

      if (attempt < STALL_RETRY_LIMIT) {
        // Retry by calling ourself recursively
        resolve(
          requestRemoteNode(url, headers, tmpFilename, httpOptions, attempt + 1)
        )
      } else {
        // TODO move to new Error type
        // eslint-disable-next-line prefer-promise-reject-errors
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
      timeout: {
        send: CONNECTION_TIMEOUT, // https://github.com/sindresorhus/got#timeout
      },
      ...httpOptions,
      isStream: true,
    })

    let haveAllBytesBeenWritten = false
    // Fixes a bug in latest got where progress.total gets reset when stream ends, even if it wasn't complete.
    let totalSize: number | null = null
    responseStream.on(`downloadProgress`, progress => {
      // reset the timeout on each progress event to make sure large files don't timeout
      resetTimeout()

      if (
        progress.total != null &&
        (!totalSize || totalSize < progress.total)
      ) {
        totalSize = progress.total
      }

      if (progress.transferred === totalSize || totalSize === null) {
        haveAllBytesBeenWritten = true
      }
    })

    responseStream.pipe(fsWriteStream)

    // If there's a 400/500 response or other error.
    // it will trigger a finish event on fsWriteStream
    responseStream.on(`error`, error => {
      if (timeout) {
        clearTimeout(timeout)
      }

      fsWriteStream.close()
      fs.removeSync(tmpFilename)

      if (!(error instanceof RequestError)) {
        return reject(error)
      }

      // This is a replacement for the stream retry logic of got
      // till we can update all got instances to v12
      // https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md
      // https://github.com/sindresorhus/got/blob/main/documentation/3-streams.md#retry
      const statusCode = error.response?.statusCode
      const errorCode = error.code || error.message // got gives error.code, but msw/node returns the error codes in the message only

      if (
        // HTTP STATUS CODE ERRORS
        (statusCode && STATUS_CODES_TO_RETRY.includes(statusCode)) ||
        // GENERAL NETWORK ERRORS
        (errorCode && ERROR_CODES_TO_RETRY.includes(errorCode))
      ) {
        if (attempt < INCOMPLETE_RETRY_LIMIT) {
          setTimeout(() => {
            resolve(
              requestRemoteNode(
                url,
                headers,
                tmpFilename,
                httpOptions,
                attempt + 1
              )
            )
          }, BACKOFF_TIME * attempt)

          return undefined
        }
        // Throw user friendly error
        error.message = [
          `Unable to fetch:`,
          url,
          `---`,
          `Reason: ${error.message}`,
          `---`,
        ].join(`\n`)

        // Gather details about what went wrong from the error object and the request
        const details = Object.entries({
          attempt,
          method: error.options?.method,
          errorCode: error.code,
          responseStatusCode: error.response?.statusCode,
          responseStatusMessage: error.response?.statusMessage,
          requestHeaders: error.options?.headers,
          responseHeaders: error.response?.headers,
        })
          // Remove undefined values from the details to keep it clean
          .reduce((a, [k, v]) => (v === undefined ? a : ((a[k] = v), a)), {})

        if (Object.keys(details).length) {
          error.message = [
            error.message,
            `Fetch details:`,
            JSON.stringify(details, null, 2),
            `---`,
          ].join(`\n`)
        }
      }

      return reject(error)
    })

    responseStream.on(`response`, response => {
      resetTimeout()

      fsWriteStream.once(`finish`, () => {
        if (timeout) {
          clearTimeout(timeout)
        }

        // We have an incomplete download
        if (!haveAllBytesBeenWritten) {
          fs.removeSync(tmpFilename)

          if (attempt < INCOMPLETE_RETRY_LIMIT) {
            // let's give node time to remove the file
            process.nextTick(() =>
              resolve(
                requestRemoteNode(
                  url,
                  headers,
                  tmpFilename,
                  httpOptions,
                  attempt + 1
                )
              )
            )

            return undefined
          } else {
            // TODO move to new Error type
            // eslint-disable-next-line prefer-promise-reject-errors
            return reject(
              `Failed to download ${url} after ${INCOMPLETE_RETRY_LIMIT} attempts`
            )
          }
        }
        return resolve(response)
      })
    })
  })
}
