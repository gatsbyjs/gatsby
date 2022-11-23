import _ from "lodash"
import { createWriteStream, existsSync } from "fs-extra"
import { IMMUTABLE_CACHING_HEADER } from "./constants"

import {
  SECURITY_HEADERS,
  CACHING_HEADERS,
  LINK_REGEX,
  HEADERS_FILENAME,
} from "./constants"
import { emitHeaders } from "./ipc"

function getHeaderName(header) {
  const matches = header.match(/^([^:]+):/)
  return matches && matches[1]
}

function headersPath(pathPrefix, path) {
  return `${pathPrefix}${path}`
}

function defaultMerge(...headers) {
  function unionMerge(objValue, srcValue) {
    if (_.isArray(objValue)) {
      return _.union(objValue, srcValue)
    } else {
      return undefined // opt into default merge behavior
    }
  }

  return _.mergeWith({}, ...headers, unionMerge)
}

function headersMerge(userHeaders, defaultHeaders) {
  const merged = {}
  Object.keys(defaultHeaders).forEach(path => {
    if (!userHeaders[path]) {
      merged[path] = defaultHeaders[path]
      return
    }
    const headersMap = {}
    defaultHeaders[path].forEach(header => {
      headersMap[getHeaderName(header)] = header
    })
    userHeaders[path].forEach(header => {
      headersMap[getHeaderName(header)] = header // override if exists
    })
    merged[path] = Object.values(headersMap)
  })
  Object.keys(userHeaders).forEach(path => {
    if (!merged[path]) {
      merged[path] = userHeaders[path]
    }
  })
  return merged
}

function transformLink(manifest, publicFolder, pathPrefix) {
  return header =>
    header.replace(LINK_REGEX, (__, prefix, file, suffix) => {
      const hashed = manifest[file]
      if (hashed) {
        return `${prefix}${pathPrefix}${hashed}${suffix}`
      } else if (existsSync(publicFolder(file))) {
        return `${prefix}${pathPrefix}${file}${suffix}`
      } else {
        throw new Error(
          `Could not find the file specified in the Link header \`${header}\`.` +
            `The gatsby-plugin-gatsby-cloud is looking for a matching file (with or without a ` +
            `webpack hash). Check the public folder and your gatsby-config.js to ensure you are ` +
            `pointing to a public file.`
        )
      }
    })
}

// program methods

const mapUserLinkHeaders =
  ({ manifest, pathPrefix, publicFolder }) =>
  headers =>
    _.mapValues(headers, headerList =>
      _.map(headerList, transformLink(manifest, publicFolder, pathPrefix))
    )

const mapUserLinkAllPageHeaders =
  (pluginData, { allPageHeaders }) =>
  headers => {
    if (!allPageHeaders) {
      return headers
    }

    const { pages, manifest, publicFolder, pathPrefix } = pluginData

    const headersList = _.map(
      allPageHeaders,
      transformLink(manifest, publicFolder, pathPrefix)
    )

    const duplicateHeadersByPage = {}
    pages.forEach(page => {
      const pathKey = headersPath(pathPrefix, page.path)
      duplicateHeadersByPage[pathKey] = headersList
    })

    return defaultMerge(headers, duplicateHeadersByPage)
  }

const applySecurityHeaders =
  ({ mergeSecurityHeaders }) =>
  headers => {
    if (!mergeSecurityHeaders) {
      return headers
    }

    // It is a common use case to want to iframe preview
    if (process.env.GATSBY_IS_PREVIEW === `true`) {
      SECURITY_HEADERS[`/*`] = SECURITY_HEADERS[`/*`].filter(
        headers => headers !== `X-Frame-Options: DENY`
      )
    }

    return headersMerge(headers, SECURITY_HEADERS)
  }

const applyCachingHeaders =
  (pluginData, { mergeCachingHeaders }) =>
  headers => {
    if (!mergeCachingHeaders) {
      return headers
    }

    const files = new Set()
    for (const [
      _assetOrChunkName,
      fileNameOrArrayOfFileNames,
    ] of Object.entries(pluginData.manifest)) {
      if (Array.isArray(fileNameOrArrayOfFileNames)) {
        for (const filename of fileNameOrArrayOfFileNames) {
          files.add(filename)
        }
      } else if (typeof fileNameOrArrayOfFileNames === `string`) {
        files.add(fileNameOrArrayOfFileNames)
      }
    }

    const cachingHeaders = {}

    files.forEach(file => {
      if (typeof file === `string`) {
        cachingHeaders[`/` + file] = [IMMUTABLE_CACHING_HEADER]
      }
    })

    return defaultMerge(headers, cachingHeaders, CACHING_HEADERS)
  }

const applyTransfromHeaders =
  ({ transformHeaders }) =>
  headers =>
    _.mapValues(headers, transformHeaders)

const sendHeadersViaIPC = async headers => {
  /**
   * Emit Headers via IPC
   */
  let lastMessage
  Object.entries(headers).forEach(([k, val]) => {
    lastMessage = emitHeaders({
      url: k,
      headers: val,
    })
  })
  await lastMessage
}

const writeHeadersFile = async (publicFolder, contents) =>
  new Promise((resolve, reject) => {
    const contentsStr = JSON.stringify(contents)
    const writeStream = createWriteStream(publicFolder(HEADERS_FILENAME))
    const chunkSize = 10000
    const numChunks = Math.ceil(contentsStr.length / chunkSize)

    for (let i = 0; i < numChunks; i++) {
      writeStream.write(
        contentsStr.slice(
          i * chunkSize,
          Math.min((i + 1) * chunkSize, contentsStr.length)
        )
      )
    }

    writeStream.end()
    writeStream.on(`finish`, () => {
      resolve()
    })
    writeStream.on(`error`, reject)
  })

const saveHeaders =
  ({ publicFolder }) =>
  contents =>
    Promise.all([
      sendHeadersViaIPC(contents),
      writeHeadersFile(publicFolder, contents),
    ])

export default function buildHeadersProgram(pluginData, pluginOptions) {
  return _.flow(
    mapUserLinkHeaders(pluginData),
    applySecurityHeaders(pluginOptions),
    applyCachingHeaders(pluginData, pluginOptions),
    mapUserLinkAllPageHeaders(pluginData, pluginOptions),
    applyTransfromHeaders(pluginOptions),
    saveHeaders(pluginData)
  )(pluginOptions.headers)
}
