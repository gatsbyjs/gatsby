import type { IFunctionDefinition } from "gatsby"
import packageJson from "gatsby-adapter-netlify/package.json"
import { copySync, ensureDir, readJSONSync } from "fs-extra"
import { existsSync, readdirSync, realpathSync, writeFileSync } from "node:fs"
import { dirname, extname, join, sep } from "node:path"
import { slash } from "gatsby-core-utils/path"
import { cwd } from "node:process"
import { relative } from "node:path/posix"

export async function prepareFunction(fun: IFunctionDefinition): Promise<void> {
  const functionId = fun.functionId

  const frameworksApiFunctionsDir = join(cwd(), `.netlify`, `v1`, `functions`)
  await ensureDir(frameworksApiFunctionsDir)

  function getRelativePathToModule(modulePath: string): string {
    const absolutePath = require.resolve(modulePath)

    return (
      `./` + relative(slash(frameworksApiFunctionsDir), slash(absolutePath))
    )
  }

  /*
    Locates a node_modules package directory using three strategies in order:

      A) Walk up from cwd() checking standard locations at each level.
        Handles npm/yarn workspaces monorepos where deps are hoisted to a parent directory.

      B) Follow the adapter's real path into pnpm's virtual store and look for the
        package as a sibling (pnpm sibling layout for adapter deps like `cookie`).

      C) Same as B but via gatsby's real path (for gatsby's own deps like `fs-extra`, `linkfs`).

      Avoids require.resolve() without a `paths` option because that resolves relative to
      the adapter's physical location — in the dev monorepo (symlinked adapter) that
      produces paths under packages/gatsby-adapter-netlify/ rather than the user's project.
  */

  function findNodeModuleDir(
    packageName: string,
    optional = false
  ): string | undefined {
    /*
      Strategy A: walk up the directory tree.
      The for-loop condition `searchDir !== prev` is false only when dirname() returns
      its own argument, which happens at the filesystem root — so this terminates.
    */

    for (
      let searchDir = cwd(), prev = ``;
      searchDir !== prev;
      prev = searchDir, searchDir = dirname(searchDir)
    ) {
      const candidates = [
        join(
          searchDir,
          `node_modules`,
          `gatsby-adapter-netlify`,
          `node_modules`,
          packageName
        ),
        join(searchDir, `node_modules`, packageName),
      ]

      for (const dir of candidates) {
        if (existsSync(join(dir, `package.json`))) {
          return dir
        }
      }
    }

    /*
      Strategy B: pnpm virtual store via adapter's sibling layout
      (covers adapter deps like `cookie` that aren't hoisted to project root)
    */

    try {
      const adapterLink = join(cwd(), `node_modules`, `gatsby-adapter-netlify`)

      if (existsSync(adapterLink)) {
        const adapterReal = realpathSync(adapterLink)
        // adapterReal = .../node_modules/.pnpm/gatsby-adapter-netlify@X/node_modules/gatsby-adapter-netlify
        // package is a sibling one directory up in the same node_modules
        const siblingDir = join(dirname(adapterReal), packageName)

        if (existsSync(join(siblingDir, `package.json`))) {
          return siblingDir
        }
      }
    } catch {
      // ignore — realpathSync can throw if the symlink is broken
    }

    /*
      Strategy C: pnpm virtual store via gatsby's sibling layout
      (covers gatsby's own deps like `fs-extra` and `linkfs`)
    */

    try {
      const gatsbyLink = join(cwd(), `node_modules`, `gatsby`)

      if (existsSync(gatsbyLink)) {
        const gatsbyReal = realpathSync(gatsbyLink)
        const siblingDir = join(dirname(gatsbyReal), packageName)

        if (existsSync(join(siblingDir, `package.json`))) {
          return siblingDir
        }
      }
    } catch {
      // ignore
    }

    if (!optional) {
      throw new Error(
        `gatsby-adapter-netlify: Could not find '${packageName}' in node_modules. ` +
          `Tried walking up from ${cwd()} and probing pnpm virtual store siblings.`
      )
    }

    return undefined
  }

  /*
    When a package is found inside pnpm's virtual store (.pnpm/), it isn't reachable
    by name from lambda.js's location at runtime (no root symlink for indirect deps).
    Copy it to .cache/page-ssr/node_modules/<pkg>/ so Node.js finds it there first
    (nearest ancestor node_modules wins in the CJS resolution algorithm).
  */

  function ensureRuntimeResolvable(dir: string, packageName: string): string {
    const isVirtualStore =
      dir.includes(`${sep}node_modules${sep}.pnpm${sep}`) ||
      dir.includes(`/node_modules/.pnpm/`)

    if (!isVirtualStore) {
      return dir
    }

    const copyTarget = join(
      cwd(),
      `.cache`,
      `page-ssr`,
      `node_modules`,
      packageName
    )

    if (!existsSync(copyTarget)) {
      copySync(dir, copyTarget)
    }

    return copyTarget
  }

  function isExcludedDir(name: string): boolean {
    return name === `__tests__`
  }

  function isExcludedFile(name: string): boolean {
    const lower = name.toLowerCase()
    return (
      extname(lower) === `.md` ||
      lower.startsWith(`license`) ||
      lower.startsWith(`licence`) ||
      lower === `tsconfig.json` ||
      lower === `gulpfile.js`
    )
  }

  /*
    Recursively collects site-root-relative file paths for a package and all of
    its transitive dependencies. Scanning the directory rather than returning a
    glob lets us exclude documentation and license files in code without relying
    on the bundler's negation-glob support. Sharing `visited` across calls
    deduplicates entries when multiple packages share a common dep
    (e.g. both fs-extra and linkfs need graceful-fs).
  */

  function collectNodeModuleFiles(
    packageName: string,
    optional = false,
    visited = new Set<string>()
  ): Array<string> {
    if (visited.has(packageName)) {
      return []
    }

    visited.add(packageName)
    const rawDir = findNodeModuleDir(packageName, optional)

    if (!rawDir) {
      return []
    }

    const dir = ensureRuntimeResolvable(rawDir, packageName)
    const files: Array<string> = []

    function walk(currentDir: string): void {
      for (const entry of readdirSync(currentDir, {
        withFileTypes: true,
      })) {
        if (entry.isDirectory()) {
          if (!isExcludedDir(entry.name)) {
            walk(join(currentDir, entry.name))
          }
        } else if (entry.isFile() && !isExcludedFile(entry.name)) {
          files.push(
            slash(relative(slash(cwd()), slash(join(currentDir, entry.name))))
          )
        }
      }
    }

    walk(dir)

    const pkg = readJSONSync(join(dir, `package.json`)) as {
      dependencies?: Record<string, string>
    }

    for (const dep of Object.keys(pkg.dependencies ?? {})) {
      files.push(...collectNodeModuleFiles(dep, true, visited))
    }

    return files
  }

  const cookieDir = ensureRuntimeResolvable(
    findNodeModuleDir(`cookie`) as string,
    `cookie`
  )

  const cookiePkg = readJSONSync(join(cookieDir, `package.json`)) as {
    main?: string
  }

  const cookieImportPath =
    `./` +
    relative(
      slash(frameworksApiFunctionsDir),
      slash(join(cookieDir, cookiePkg.main ?? `index.js`))
    )

  const handlerSource = /* javascript */ `import { Buffer } from 'node:buffer'
import { IncomingMessage } from 'node:http'
import { Readable, Stream } from 'node:stream'
import { warn } from 'node:console'
import { createRequire as __createRequire } from 'node:module'
import { constants as __fsConstants } from 'node:fs'
import cookie from '${cookieImportPath}'

function preferDefault(m) {
  return m && m.default || m
}

/*
  --- Claude coded ---
  F_OK/R_OK/W_OK/X_OK are not own-enumerable on this fs-extra install.
  linkfs copies them into lfs via its props list leaving lfs.F_OK = undefined.
  Gatsby's setupFsWrapper (called at lambda.js module-load time) then calls
  Object.hasOwnProperty.call(undefined, 'native') which throws.
  Must run before the lambda.js import below so the CJS require cache is
  already populated with the patched module when lambda.js does require('fs-extra').
*/

const __require = __createRequire(import.meta.url)
const __fsExtra = __require('fs-extra')

for (
  const [__k, __v] of [['F_OK', __fsConstants.F_OK],
  ['R_OK', __fsConstants.R_OK], ['W_OK', __fsConstants.W_OK],
  ['X_OK', __fsConstants.X_OK]]
) {
  if (!Object.prototype.hasOwnProperty.call(__fsExtra, __k)) {
    __fsExtra[__k] = __v
  }
}

const functionModule = await import("${getRelativePathToModule(
    join(cwd(), fun.pathToEntryPoint)
  )}")

/*
  lambda.js is a Babel-compiled CJS module (exports.__esModule = true, exports.default = handler).
  When loaded via ESM import(), Node.js sets functionModule.default = module.exports (the full
  exports object), not the .default within it. Apply preferDefault twice to unwrap both layers.
*/

const functionHandler = preferDefault(preferDefault(functionModule))

const { findEnginePageByPath } = await import("${getRelativePathToModule(
    join(cwd(), `.cache`, `page-ssr`, `index.js`)
  )}")

const statuses = {
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
}

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
}

export const config = {
  excludedPath: [
    '/*.avif', '/*.bmp', '/*.css', '/*.eot', '/*.gif', '/*.ico', '/*.jpeg', '/*.jpg',
    '/*.js', '/*.map', '/*.mjs', '/*.mp3', '/*.mp4', '/*.otf', '/*.pdf',
    '/*.png', '/*.svg', '/*.ttf', '/*.txt', '/*.webm', '/*.webp', '/*.woff', '/*.woff2',
  ],
  externalNodeModules: ['msgpackr-extract'],
  generator: 'gatsby-adapter-netlify@${packageJson?.version ?? `unknown`}',
  includedFiles: ${JSON.stringify(
    ((): Array<string> => {
      const visited = new Set<string>()
      return [
        ...collectNodeModuleFiles(`cookie`, false, visited),
        ...collectNodeModuleFiles(`fs-extra`, false, visited),
        ...collectNodeModuleFiles(`linkfs`, true, visited),
        ...fun.requiredFiles.map(file =>
          slash(file).replace(/\[/g, `*`).replace(/]/g, `*`)
        ),
      ]
    })()
  )},
  name: 'Gatsby Server',
  nodeBundler: 'none',
  path: '/*',
  preferStatic: true
}`

  writeFileSync(
    join(frameworksApiFunctionsDir, `${functionId}.mjs`),
    handlerSource
  )
}
