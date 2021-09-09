import got, { Headers, Options } from "got"
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
}

const cacheIdForHeaders = (url: string): string =>
  `create-remote-file-node-headers-${url}`
const cacheIdForExtensions = (url: string): string =>
  `create-remote-file-node-extension-${url}`

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
const requestRemoteNode = (
  url: string | URL,
  headers: Headers,
  tmpFilename: string,
  httpOptions?: Options,
  attempt: number = 1
): Promise<IncomingMessage> =>
  new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout
    const fsWriteStream = fs.createWriteStream(tmpFilename)

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
    responseStream.on(`error`, error => {
      if (timeout) {
        clearTimeout(timeout)
      }

      fsWriteStream.close()
      fs.removeSync(tmpFilename)
      reject(error)
    })

    fsWriteStream.on(`error`, (error: unknown) => {
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

        fsWriteStream.close()

        // We have an incomplete download
        if (!haveAllBytesBeenWritten) {
          fs.removeSync(tmpFilename)

          if (attempt < INCOMPLETE_RETRY_LIMIT) {
            return resolve(
              requestRemoteNode(
                url,
                headers,
                tmpFilename,
                httpOptions,
                attempt + 1
              )
            )
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

export async function fetchRemoteFile({
  url,
  cache,
  auth = {},
  httpHeaders = {},
  ext,
  name,
}: IFetchRemoteFileOptions): Promise<string> {
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
  const httpOptions: Options = {}
  if (auth && (auth.htaccess_pass || auth.htaccess_user)) {
    httpOptions.username = auth.htaccess_user
    httpOptions.password = auth.htaccess_pass
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
  const response = await requestRemoteNode(
    url,
    headers,
    tmpFilename,
    httpOptions
  )

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

  const filename = createFilePath(
    path.join(pluginCacheDir, digest),
    name,
    ext as string
  )
  // If the status code is 200, move the piped temp file to the real name.
  if (response.statusCode === 200) {
    await fs.move(tmpFilename, filename, { overwrite: true })
    // Else if 304, remove the empty response.
  } else {
    await fs.remove(tmpFilename)
  }

  return filename
}
