import got from "got"
import fileType from "file-type"
import path from "path"
import { IncomingMessage, OutgoingHttpHeaders, Agent } from "http"
import fs from "fs-extra"
import { createContentDigest } from "./create-content-digest"
import {
  getRemoteFileName,
  getRemoteFileExtension,
  createFilePath,
} from "./filename-utils"

import { GatsbyCache } from "gatsby"

export interface IFetchRemoteFileOptions {
  url: string
  cache: GatsbyCache
  auth?: {
    htaccess_pass?: string
    htaccess_user?: string
  },
  httpOptions?: {
    auth?: string
    agent?: {
      http?: Agent
      https?: Agent
    }
  },
  httpHeaders?: OutgoingHttpHeaders
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
 * @param  {Object}   httpOpts
 * @param  {number}   attempt
 * @return {Promise<Object>}  Resolves with the [http Result Object]{@link https://nodejs.org/api/http.html#http_class_http_serverresponse}
 */
const requestRemoteNode = (
  url: got.GotUrl,
  headers: OutgoingHttpHeaders,
  tmpFilename: string,
  httpOpts: got.GotOptions | undefined,
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
      timeout: {
        send: CONNECTION_TIMEOUT, // https://github.com/sindresorhus/got#timeout
      },
      ...httpOpts,
    })

    let haveAllBytesBeenWritten = false
    responseStream.on(`downloadProgress`, progress => {
      if (
        progress.transferred === progress.total ||
        progress.total === null ||
        progress.total === undefined
      ) {
        haveAllBytesBeenWritten = true
      }
    })

    responseStream.pipe(fsWriteStream)

    // If there's a 400/500 response or other error.
    responseStream.on(`error`, error => {
      if (timeout) {
        clearTimeout(timeout)
      }
      fs.removeSync(tmpFilename)
      reject(error)
    })

    fsWriteStream.on(`error`, (error: any) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      reject(error)
    })

    responseStream.on(`response`, response => {
      resetTimeout()

      fsWriteStream.on(`finish`, () => {
        fsWriteStream.close()

        // We have an incomplete download
        if (!haveAllBytesBeenWritten) {
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

export async function fetchRemoteFile({
  url,
  cache,
  auth = {},
  httpOptions = {},
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
  if (auth && (auth.htaccess_pass || auth.htaccess_user)) {
    httpOptions.auth = `${auth.htaccess_user}:${auth.htaccess_pass}`
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
  const response = await requestRemoteNode(url, headers, tmpFilename, httpOptions)

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
