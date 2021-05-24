import _ from "lodash"
import { writeFile, existsSync } from "fs-extra"
import { parse, posix } from "path"
import kebabHash from "kebab-hash"
import { HEADER_COMMENT, IMMUTABLE_CACHING_HEADER } from "./constants"

import {
  COMMON_BUNDLES,
  SECURITY_HEADERS,
  CACHING_HEADERS,
  LINK_REGEX,
  NETLIFY_HEADERS_FILENAME,
  PAGE_DATA_DIR,
} from "./constants"

function getHeaderName(header) {
  const matches = header.match(/^([^:]+):/)
  return matches && matches[1]
}

function validHeaders(headers, reporter) {
  if (!headers || !_.isObject(headers)) {
    return false
  }

  return _.every(
    headers,
    (headersList, path) =>
      _.isArray(headersList) &&
      _.every(headersList, header => {
        if (_.isString(header)) {
          if (!getHeaderName(header)) {
            reporter.panic(
              `[gatsby-plugin-netlify] ${path} contains an invalid header (${header}). Please check your plugin configuration`
            )
          }

          return true
        }

        return false
      })
  )
}

function linkTemplate(assetPath, type = `script`) {
  return `Link: <${assetPath}>; rel=preload; as=${type}${
    type === `fetch` ? `; crossorigin` : ``
  }`
}

function pathChunkName(path) {
  const name = path === `/` ? `index` : kebabHash(path)
  return `path---${name}`
}

function getPageDataPath(path) {
  const fixedPagePath = path === `/` ? `index` : path
  return posix.join(`page-data`, fixedPagePath, `page-data.json`)
}

function getScriptPath(file, manifest) {
  const chunk = manifest[file]

  if (!chunk) {
    return []
  }

  // convert to array if it's not already
  const chunks = _.isArray(chunk) ? chunk : [chunk]

  return chunks.filter(script => {
    const parsed = parse(script)
    // handle only .js, .css content is inlined already
    // and doesn't need to be pushed
    return parsed.ext === `.js`
  })
}

function linkHeaders(files, pathPrefix) {
  const linkHeaders = []
  for (const resourceType in files) {
    files[resourceType].forEach(file => {
      linkHeaders.push(linkTemplate(`${pathPrefix}/${file}`, resourceType))
    })
  }

  return linkHeaders
}

function headersPath(pathPrefix, path) {
  return `${pathPrefix}${path}`
}

function preloadHeadersByPage({ pages, manifest, pathPrefix, publicFolder }) {
  const linksByPage = {}

  const appDataPath = publicFolder(PAGE_DATA_DIR, `app-data.json`)
  const hasAppData = existsSync(appDataPath)

  let hasPageData = false
  if (pages.size) {
    // test if 1 page-data file exists, if it does we know we're on a gatsby version that supports page-data
    const pageDataPath = publicFolder(
      getPageDataPath(pages.get(pages.keys().next().value).path)
    )
    hasPageData = existsSync(pageDataPath)
  }

  pages.forEach(page => {
    const scripts = _.flatMap(COMMON_BUNDLES, file =>
      getScriptPath(file, manifest)
    )
    scripts.push(...getScriptPath(pathChunkName(page.path), manifest))
    scripts.push(...getScriptPath(page.componentChunkName, manifest))

    const json = []
    if (hasAppData) {
      json.push(posix.join(PAGE_DATA_DIR, `app-data.json`))
    }

    if (hasPageData) {
      json.push(getPageDataPath(page.path))
    }

    const filesByResourceType = {
      script: scripts.filter(Boolean),
      fetch: json,
    }

    const pathKey = headersPath(pathPrefix, page.path)
    linksByPage[pathKey] = linkHeaders(filesByResourceType, pathPrefix)
  })

  return linksByPage
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
            `The gatsby-plugin-netlify is looking for a matching file (with or without a ` +
            `webpack hash). Check the public folder and your gatsby-config.js to ensure you are ` +
            `pointing to a public file.`
        )
      }
    })
}

// Writes out headers file format, with two spaces for indentation
// https://www.netlify.com/docs/headers-and-basic-auth/
function stringifyHeaders(headers) {
  return _.reduce(
    headers,
    (text, headerList, path) => {
      const headersString = _.reduce(
        headerList,
        (accum, header) => `${accum}  ${header}\n`,
        ``
      )
      return `${text}${path}\n${headersString}`
    },
    ``
  )
}

// program methods

const validateUserOptions = (pluginOptions, reporter) => headers => {
  if (!validHeaders(headers, reporter)) {
    throw new Error(
      `The "headers" option to gatsby-plugin-netlify is in the wrong shape. ` +
        `You should pass in a object with string keys (representing the paths) and an array ` +
        `of strings as the value (representing the headers). ` +
        `Check your gatsby-config.js.`
    )
  }

  ;[`mergeSecurityHeaders`, `mergeLinkHeaders`, `mergeCachingHeaders`].forEach(
    mergeOption => {
      if (!_.isBoolean(pluginOptions[mergeOption])) {
        throw new Error(
          `The "${mergeOption}" option to gatsby-plugin-netlify must be a boolean. ` +
            `Check your gatsby-config.js.`
        )
      }
    }
  )

  if (!_.isFunction(pluginOptions.transformHeaders)) {
    throw new Error(
      `The "transformHeaders" option to gatsby-plugin-netlify must be a function ` +
        `that returns an array of header strings. ` +
        `Check your gatsby-config.js.`
    )
  }

  return headers
}

const mapUserLinkHeaders = ({
  manifest,
  pathPrefix,
  publicFolder,
}) => headers =>
  _.mapValues(headers, headerList =>
    _.map(headerList, transformLink(manifest, publicFolder, pathPrefix))
  )

const mapUserLinkAllPageHeaders = (
  pluginData,
  { allPageHeaders }
) => headers => {
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

const applyLinkHeaders = (pluginData, { mergeLinkHeaders }) => headers => {
  if (!mergeLinkHeaders) {
    return headers
  }

  const { pages, manifest, pathPrefix, publicFolder } = pluginData
  const perPageHeaders = preloadHeadersByPage({
    pages,
    manifest,
    pathPrefix,
    publicFolder,
  })

  return defaultMerge(headers, perPageHeaders)
}

const applySecurityHeaders = ({ mergeSecurityHeaders }) => headers => {
  if (!mergeSecurityHeaders) {
    return headers
  }

  return headersMerge(headers, SECURITY_HEADERS)
}

const applyCachingHeaders = (
  pluginData,
  { mergeCachingHeaders }
) => headers => {
  if (!mergeCachingHeaders) {
    return headers
  }

  let chunks = []
  // Gatsby v3.5 added componentChunkName to store().components
  // So we prefer to pull chunk names off that as it gets very expensive to loop
  // over large numbers of pages.
  const isComponentChunkSet = !!pluginData.components.entries()?.next()
    ?.value[1]?.componentChunkName
  if (isComponentChunkSet) {
    chunks = [...pluginData.components.values()].map(c => c.componentChunkName)
  } else {
    chunks = Array.from(pluginData.pages.values()).map(
      page => page.componentChunkName
    )
  }

  chunks.push(`pages-manifest`, `app`)

  const files = [].concat(...chunks.map(chunk => pluginData.manifest[chunk]))

  const cachingHeaders = {}

  files.forEach(file => {
    if (typeof file === `string`) {
      cachingHeaders[`/` + file] = [IMMUTABLE_CACHING_HEADER]
    }
  })

  return defaultMerge(headers, cachingHeaders, CACHING_HEADERS)
}

const applyTransfromHeaders = ({ transformHeaders }) => headers =>
  _.mapValues(headers, transformHeaders)

const transformToString = headers =>
  `${HEADER_COMMENT}\n\n${stringifyHeaders(headers)}`

const writeHeadersFile = ({ publicFolder }) => contents =>
  writeFile(publicFolder(NETLIFY_HEADERS_FILENAME), contents)

export default function buildHeadersProgram(
  pluginData,
  pluginOptions,
  reporter
) {
  return _.flow(
    validateUserOptions(pluginOptions, reporter),
    mapUserLinkHeaders(pluginData),
    applySecurityHeaders(pluginOptions),
    applyCachingHeaders(pluginData, pluginOptions),
    mapUserLinkAllPageHeaders(pluginData, pluginOptions),
    applyLinkHeaders(pluginData, pluginOptions),
    applyTransfromHeaders(pluginOptions),
    transformToString,
    writeHeadersFile(pluginData)
  )(pluginOptions.headers)
}
