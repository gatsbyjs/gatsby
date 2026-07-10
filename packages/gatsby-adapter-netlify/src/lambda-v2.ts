import type { IFunctionDefinition } from "gatsby"

import { createRequire } from "node:module"
import { cwd } from "node:process"
import { ensureDir } from "fs-extra"
import { join } from "node:path"
import { relative } from "node:path/posix"
import { slash } from "gatsby-core-utils/path"
import { writeFileSync } from "node:fs"

import { generator } from "./generator"

const require = createRequire(__filename)

/*
  Converts Gatsby's file-system route bracket syntax to a Netlify Functions v2
  path (which is matched using the URLPattern spec):
  - /api/param/[slug]   => /api/param/:slug
  - /api/wildcard/[...] => /api/wildcard/*
  - /api/wildcard/[...slug] => /api/wildcard/:slug*

  * and :slug* match identical sets of URLs (both consume everything after
  the prefix, across any number of segments) — the only difference is the
  key the captured value is exposed under in context.params: * is an
  unnamed group, so it's exposed as the index key "0" (guaranteed by the
  URLPattern spec). :slug* is a named repeat-modifier group; Netlify's docs
  only show named groups for single-segment :id-style params, not this
  modifier, so the "slug" key is verified against the current implementation
  but not a documented guarantee — only named splat params (from a
  [...slug] route) are at risk if that ever changes.
*/

function toNetlifyFunctionPath(name: string): string {
  return name
    .replace(/\[\.\.\.\]/g, `*`)
    .replace(/\[\.\.\.([^\]]+)\]/g, `:$1*`)
    .replace(/\[([^\]]+)\]/g, `:$1`)
}

export async function prepareFunction(fun: IFunctionDefinition): Promise<void> {
  const functionId = fun.functionId
  const isApiRoute = fun.name.startsWith(`/api/`)

  const frameworksApiFunctionsDir = join(cwd(), `.netlify`, `v1`, `functions`)
  await ensureDir(frameworksApiFunctionsDir)

  function getRelativePathToModule(modulePath: string): string {
    const absolutePath = require.resolve(modulePath)

    return (
      `./` + relative(slash(frameworksApiFunctionsDir), slash(absolutePath))
    )
  }

  const cookieModulePath = require.resolve(`./vendor/cookie`)
  const cookieImportPath = getRelativePathToModule(`./vendor/cookie`)

  const commonImports = /* javascript */ `import { Buffer } from 'node:buffer'
import { IncomingMessage } from 'node:http'
import { Readable, Stream } from 'node:stream'
import { warn } from 'node:console'
import cookie from '${cookieImportPath}'`

  const preferDefaultFn = /* javascript */ `function preferDefault(m) {
  return m && m.default || m
}`

  const functionLoader = /* javascript */ `const functionModule = await import("${getRelativePathToModule(
    join(cwd(), fun.pathToEntryPoint)
  )}")

const functionHandler = preferDefault(preferDefault(functionModule))`

  const handleRequestFn = /* javascript */ `async function handleRequest(request, context, shouldCache) {
  const req = await createRequestObject(request, context)

  return new Promise(async function (resolve) {
    try {
      const res = createResponseObject({
        onResEnd: resolve,
        shouldCache
      })

      await functionHandler(req, res)
    } catch (error) {
      console.error("Error executing " + request.url, error)
      resolve(new Response(null, { status: 500 }))
    }
  })
}`

  // Shared JS runtime helpers embedded in both SSR and API route handlers
  const sharedHandlerCode = `const statuses = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "103": "Early Hints",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a Teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Too Early",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

async function createRequestObject(netlifyRequest, netlifyContext) {
  const req = Object.assign(new Readable(), IncomingMessage.prototype)

  req.getHeader = function(name) {
    return req.headers[name.toLowerCase()]
  }

  req.getHeaders = function() {
    return req.headers
  }

  req.headers = {}
  req.rawHeaders = []

  for (const [key, value] of netlifyRequest.headers) {
    req.rawHeaders.push(key, value)
    req.headers[key] = value
  }

  const cookies = req.headers.cookie

  if (cookies) {
    req.cookies = cookie.parse(cookies)
  }

  req.method = netlifyRequest.method

  const multiValueQuery = {}

  for (const key of new Set(netlifyContext.url.searchParams.keys())) {
    multiValueQuery[key] = netlifyContext.url.searchParams.getAll(key)
  }

  req.multiValueQuery = multiValueQuery

  req.originalUrl = netlifyContext.url.pathname

  // Unnamed splats (from a [...] route) come back keyed by index
  // alias to * per Gatsby's Functions API
  req.params = {
    ...netlifyContext.params
  }

  if (req.params['0'] !== undefined) {
    req.params['*'] = req.params['0']
  }

  req.query = Object.fromEntries(netlifyContext.url.searchParams)
  req.rawUrl = netlifyRequest.url
  req.url = req.originalUrl

  const requestBodyBuffer = await netlifyRequest.arrayBuffer()
  req.push(Buffer.from(requestBodyBuffer))
  req.push(null)

  return req
}

function createResponseObject({ onResEnd, shouldCache }) {
  function isProtectedHeader(name, override = false) {
    if (override) {
      return false
    }

    const lower = name.toLowerCase()
    return lower === 'content-type' || (shouldCache && lower === 'netlify-cdn-cache-control')
  }

  const response = {
    body: undefined,
    statusCode: undefined
  }

  const res = new Stream()
  Object.defineProperty(res, 'statusCode', {
    get() {
      return response.statusCode
    },
    set(statusCode) {
      response.statusCode = statusCode
    }
  })

  res.end = function (text) {
    if (text) {
      res.write(text)
    }

    if (!res.statusCode) {
      res.statusCode = 200
    }

    res.finished = true
    res.writableEnded = true

    onResEnd(new Response(response.body ?? null, {
      headers: res.headers,
      status: response.statusCode
    }))

    return res
  }

  res.getHeader = function (name) {
    return res.headers[name.toLowerCase()]
  }

  res.getHeaders = function () {
    return res.headers
  }

  res.hasHeader = function (name) {
    return Boolean(res.getHeader(name))
  }

  res.headers = {
    'content-type': 'text/html; charset=utf-8',
    ...(
      shouldCache ? {
        'netlify-cdn-cache-control': 'durable, immutable, max-age=31536000, public'
      } : {}
    )
  }

  res.removeHeader = function (name) {
    if (isProtectedHeader(name)) {
      warn('cannot modify header ' + name)
      return
    }

    delete res.headers[name.toLowerCase()]
  }

  res.setHeader = function (name, value, override = false) {
    if (isProtectedHeader(name, override)) {
      warn('cannot modify header ' + name)
      return res
    }

    res.headers[name.toLowerCase()] = value
    return res
  }

  res.write = function (chunk) {
    if (!response.body) {
      response.body = Buffer.from('')
    }

    response.body = Buffer.concat([
      Buffer.from(response.body),
      Buffer.from(chunk)
    ])

    return true
  }

  res.writeHead = function (status, headers) {
    response.statusCode = status

    if (headers) {
      for (const [name, value] of Object.entries(headers)) {
        res.setHeader(name, value)
      }
    }

    // Return res object to allow for chaining
    // Fixes: https://github.com/netlify/next-on-netlify/pull/74
    return res
  }

  // Gatsby Functions additions
  res.json = function (data) {
    if (res.finished) {
      return res
    }

    res.setHeader('content-type', 'application/json', true)
    res.end(JSON.stringify(data))
    return res
  }

  res.status = function (code) {
    const numericCode = Number.parseInt(code)

    if (!Number.isNaN(numericCode)) {
      response.statusCode = numericCode
    }

    return res
  }

  res.redirect = function (statusCodeOrUrl, url) {
    let statusCode = statusCodeOrUrl
    let urlLocation = url

    if (!url && typeof statusCodeOrUrl === 'string') {
      urlLocation = statusCodeOrUrl
      statusCode = 302
    }

    res.writeHead(statusCode, {
      location: urlLocation
    })

    res.end()
    return res
  }

  res.send = function (data) {
    if (res.finished) {
      return res
    }

    if (typeof data === 'number') {
      return res
        .status(data)
        .setHeader('content-type', 'text/plain; charset=utf-8', true)
        .end(statuses[data] || String(data))
    }

    if (typeof data === 'boolean' || typeof data === 'object') {
      if (Buffer.isBuffer(data)) {
        res.setHeader('content-type', 'application/octet-Stream', true)
      }

      else if (data !== null) {
        return res.json(data)
      }
    }

    res.end(data)
    return res
  }

  return res
}`

  let handlerSource: string

  if (isApiRoute) {
    handlerSource = /* javascript */ `${commonImports}

${preferDefaultFn}

${functionLoader}

${sharedHandlerCode}

${handleRequestFn}

export default async function(request, context) {
  return handleRequest(request, context, false)
}

export const config = {
  generator: '${generator}',
  includedFiles: ${JSON.stringify([
    slash(cookieModulePath),
    ...fun.requiredFiles.map(file =>
      slash(join(cwd(), file)).replace(/\[/g, `*`).replace(/]/g, `*`)
    ),
  ])},
  name: 'Gatsby ${fun.name}',
  nodeBundler: 'none',
  path: '${toNetlifyFunctionPath(fun.name)}',
}`
  } else {
    handlerSource = /* javascript */ `${commonImports}

${preferDefaultFn}

${functionLoader}

const { findEnginePageByPath } = await import("${getRelativePathToModule(
      join(cwd(), `.cache`, `page-ssr`, `index.js`)
    )}")

${sharedHandlerCode}

${handleRequestFn}

function getPagePathForLookup(pathname) {
  const match = pathname.match(/^\\/?page-data\\/(.+)\\/page-data\\.json$/)
  if (match) {
    const pagePath = match[1]
    return pagePath === 'index' ? '/' : pagePath
  }
  return pathname
}

export default async function(request, context) {
  const pagePath = getPagePathForLookup(context.url.pathname)
  const page = findEnginePageByPath(pagePath)
  const shouldCache = !!page && page.mode !== 'SSR'
  return handleRequest(request, context, shouldCache)
}

export const config = {
  generator: '${generator}',
  includedFiles: ${JSON.stringify([
    slash(cookieModulePath),
    ...fun.requiredFiles.map(file =>
      slash(join(cwd(), file)).replace(/\[/g, `*`).replace(/]/g, `*`)
    ),
  ])},
  name: 'Gatsby SSR + DSG',
  nodeBundler: 'none',
  path: '/*',
  preferStatic: true
}`
  }

  writeFileSync(
    join(frameworksApiFunctionsDir, `${functionId}.mjs`),
    handlerSource
  )
}
