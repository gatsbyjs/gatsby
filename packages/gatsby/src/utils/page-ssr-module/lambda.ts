import type { GatsbyFunctionResponse, GatsbyFunctionRequest } from "gatsby"
import * as path from "path"
import * as fs from "fs-extra"
import { get as httpsGet } from "https"
import { get as httpGet, IncomingMessage, ClientRequest } from "http"
import { tmpdir } from "os"
import { pipeline } from "stream"
import { URL } from "url"
import { promisify } from "util"

import type { ISSRData, EnginePage } from "./entry"
import { link, rewritableMethods as linkRewritableMethods } from "linkfs"

const cdnDatastorePath = `%CDN_DATASTORE_PATH%`
// this is fallback origin, we will prefer to extract it from first request instead
// as in some cases one reported by adapter might not be correct
const cdnDatastoreOrigin = `%CDN_DATASTORE_ORIGIN%`
const PATH_PREFIX = `%PATH_PREFIX%`

// this file should be in `.cache/page-ssr-module/lambda.js`
// so getting `.cache` location should be one directory above
// directory of this file
const cacheDir = path.join(__dirname, `..`)

// gatsby relies on process.cwd() a lot, so this ensures that CWD is set correctly
// in relation to bundled files for lambda. In some scenarios those files are not in
// expected relative locations to CWD, so here we are forcing setting CWD so the
// relative paths are correct
process.chdir(path.join(cacheDir, `..`))

function setupFsWrapper(): string {
  // setup global._fsWrapper
  try {
    fs.accessSync(__filename, fs.constants.W_OK)
    return path.join(cacheDir, `data`, `datastore`)
  } catch (e) {
    // we are in a read-only filesystem, so we need to use a temp dir

    const TEMP_DIR = path.join(tmpdir(), `gatsby`)
    const TEMP_CACHE_DIR = path.join(TEMP_DIR, `.cache`)

    global.__GATSBY.root = TEMP_DIR

    // we need to rewrite fs
    const rewrites = [
      [path.join(cacheDir, `caches`), path.join(TEMP_CACHE_DIR, `caches`)],
      [
        path.join(cacheDir, `caches-lmdb`),
        path.join(TEMP_CACHE_DIR, `caches-lmdb`),
      ],
      [path.join(cacheDir, `data`), path.join(TEMP_CACHE_DIR, `data`)],
    ]

    console.log(`Preparing Gatsby filesystem`, {
      from: cacheDir,
      to: TEMP_CACHE_DIR,
      rewrites,
    })

    // copied from https://github.com/streamich/linkfs/blob/master/src/index.ts#L126-L142
    function mapPathUsingRewrites(fsPath: fs.PathLike): string {
      let filename = path.resolve(String(fsPath))
      for (const [from, to] of rewrites) {
        if (filename.indexOf(from) === 0) {
          const rootRegex = /(?:^[a-zA-Z]:\\$)|(?:^\/$)/ // C:\ vs /
          const isRoot = from.match(rootRegex)
          const baseRegex = `^(` + from.replace(/\\/g, `\\\\`) + `)`

          if (isRoot) {
            const regex = new RegExp(baseRegex)
            filename = filename.replace(regex, () => to + path.sep)
          } else {
            const regex = new RegExp(baseRegex + `(\\\\|/|$)`)
            filename = filename.replace(regex, (_match, _p1, p2) => to + p2)
          }
        }
      }
      return filename
    }

    function applyRename<
      T = typeof import("fs") | typeof import("fs").promises
    >(fsToRewrite: T, lfs: T, method: "rename" | "renameSync"): void {
      const original = fsToRewrite[method]
      if (original) {
        // @ts-ignore - complains about __promisify__ which doesn't actually exist in runtime
        lfs[method] = (
          ...args: Parameters<typeof import("fs")["rename" | "renameSync"]>
        ): ReturnType<typeof import("fs")["rename" | "renameSync"]> => {
          args[0] = mapPathUsingRewrites(args[0])
          args[1] = mapPathUsingRewrites(args[1])
          // @ts-ignore - can't decide which signature this is, but we just preserve the original
          // signature here and mostly care about first 2 arguments being PathLike
          return original.apply(fsToRewrite, args)
        }
      }
    }

    // linkfs doesn't handle following methods, so we need to add them manually
    linkRewritableMethods.push(`createWriteStream`, `createReadStream`, `rm`)

    function createLinkedFS<
      T = typeof import("fs") | typeof import("fs").promises
    >(fsToRewrite: T): T {
      const linkedFS = link(fsToRewrite, rewrites) as T

      // linkfs doesn't handle `to` argument in `rename` and `renameSync` methods
      applyRename(fsToRewrite, linkedFS, `rename`)
      applyRename(fsToRewrite, linkedFS, `renameSync`)

      return linkedFS
    }

    // Alias the cache dir paths to the temp dir
    const lfs = createLinkedFS(fs)

    // linkfs doesn't pass across the `native` prop, which graceful-fs needs
    for (const key in lfs) {
      if (Object.hasOwnProperty.call(fs[key], `native`)) {
        lfs[key].native = fs[key].native
      }
    }
    // 'promises' is not initially linked within the 'linkfs'
    // package, and is needed by underlying Gatsby code (the
    // @graphql-tools/code-file-loader)
    lfs.promises = createLinkedFS(fs.promises)

    const originalWritesStream = fs.WriteStream
    function LinkedWriteStream(
      this: fs.WriteStream,
      ...args: Parameters<(typeof fs)["createWriteStream"]>
    ): fs.WriteStream {
      args[0] = mapPathUsingRewrites(args[0])
      args[1] =
        typeof args[1] === `string`
          ? {
              flags: args[1],
              // @ts-ignore there is `fs` property in options doh (https://nodejs.org/api/fs.html#fscreatewritestreampath-options)
              fs: lfs,
            }
          : {
              ...(args[1] || {}),
              // @ts-ignore there is `fs` property in options doh (https://nodejs.org/api/fs.html#fscreatewritestreampath-options)
              fs: lfs,
            }

      // @ts-ignore TS doesn't like extending prototype "classes"
      return originalWritesStream.apply(this, args)
    }
    LinkedWriteStream.prototype = Object.create(originalWritesStream.prototype)
    // @ts-ignore TS doesn't like extending prototype "classes"
    lfs.WriteStream = LinkedWriteStream

    const originalReadStream = fs.ReadStream
    function LinkedReadStream(
      this: fs.ReadStream,
      ...args: Parameters<(typeof fs)["createReadStream"]>
    ): fs.ReadStream {
      args[0] = mapPathUsingRewrites(args[0])
      args[1] =
        typeof args[1] === `string`
          ? {
              flags: args[1],
              // @ts-ignore there is `fs` property in options doh (https://nodejs.org/api/fs.html#fscreatewritestreampath-options)
              fs: lfs,
            }
          : {
              ...(args[1] || {}),
              // @ts-ignore there is `fs` property in options doh (https://nodejs.org/api/fs.html#fscreatewritestreampath-options)
              fs: lfs,
            }

      // @ts-ignore TS doesn't like extending prototype "classes"
      return originalReadStream.apply(this, args)
    }
    LinkedReadStream.prototype = Object.create(originalReadStream.prototype)
    // @ts-ignore TS doesn't like extending prototype "classes"
    lfs.ReadStream = LinkedReadStream

    const dbPath = path.join(TEMP_CACHE_DIR, `data`, `datastore`)

    // Gatsby uses this instead of fs if present
    // eslint-disable-next-line no-underscore-dangle
    // @ts-ignore __promisify__ stuff
    global._fsWrapper = lfs

    if (!cdnDatastorePath) {
      const dir = `data`
      if (
        !process.env.NETLIFY_LOCAL &&
        fs.existsSync(path.join(TEMP_CACHE_DIR, dir))
      ) {
        console.log(`directory already exists`)
        return dbPath
      }
      console.log(`Start copying ${dir}`)

      fs.copySync(path.join(cacheDir, dir), path.join(TEMP_CACHE_DIR, dir))
      console.log(`End copying ${dir}`)
    }

    return dbPath
  }
}

global.__GATSBY = {
  root: process.cwd(),
  buildId: ``,
}

// eslint-disable-next-line no-constant-condition
if (`%IMAGE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH%`) {
  global.__GATSBY.imageCDNUrlGeneratorModulePath = require.resolve(
    `%IMAGE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH%`
  )
}
// eslint-disable-next-line no-constant-condition
if (`%FILE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH%`) {
  global.__GATSBY.fileCDNUrlGeneratorModulePath = require.resolve(
    `%FILE_CDN_URL_GENERATOR_MODULE_RELATIVE_PATH%`
  )
}

const dbPath = setupFsWrapper()

// using require instead of import here for now because of type hell + import path doesn't exist in current context
// as this file will be copied elsewhere

type GraphQLEngineType =
  import("../../schema/graphql-engine/entry").GraphQLEngine

const { GraphQLEngine } =
  require(`../query-engine`) as typeof import("../../schema/graphql-engine/entry")

const { getData, renderPageData, renderHTML, findEnginePageByPath } =
  require(`./index`) as typeof import("./entry")

const streamPipeline = promisify(pipeline)

function get(
  url: string,
  callback?: (res: IncomingMessage) => void
): ClientRequest {
  return new URL(url).protocol === `https:`
    ? httpsGet(url, callback)
    : httpGet(url, callback)
}

interface IEngineError extends Error {
  downloadError?: boolean
}

function shouldDownloadDatastoreFromCDN(): boolean {
  return !!cdnDatastorePath
}

async function downloadDatastoreFromCDN(origin: string): Promise<void> {
  const cdnDatastore = `${origin}/${cdnDatastorePath}`
  // if this variable is set we need to download the datastore from the CDN
  const downloadPath = dbPath + `/data.mdb`
  console.log(
    `Downloading datastore from CDN (${cdnDatastore} -> ${downloadPath})`
  )

  await fs.ensureDir(dbPath)
  await new Promise((resolve, reject) => {
    const req = get(cdnDatastore, response => {
      if (
        !response.statusCode ||
        response.statusCode < 200 ||
        response.statusCode > 299
      ) {
        const engineError = new Error(
          `Failed to download ${cdnDatastore}: ${response.statusCode} ${
            response.statusMessage || ``
          }`
        ) as IEngineError
        engineError.downloadError = true
        reject(engineError)
        return
      }

      const fileStream = fs.createWriteStream(downloadPath)
      streamPipeline(response, fileStream)
        .then(resolve)
        .catch(error => {
          console.log(`Error downloading ${cdnDatastore}`, error)
          const engineError = error as IEngineError
          engineError.downloadError = true
          reject(engineError)
        })
    })

    req.on(`error`, error => {
      console.log(`Error downloading ${cdnDatastore}`, error)
      const engineError = error as IEngineError
      engineError.downloadError = true
      reject(engineError)
    })
  })
  console.log(`Downloaded datastore from CDN`)
}

async function initializeGraphqlEngine(
  origin: string
): Promise<GraphQLEngineType> {
  if (shouldDownloadDatastoreFromCDN()) {
    await downloadDatastoreFromCDN(origin)
  }

  const graphqlEngine = new GraphQLEngine({
    dbPath,
  })

  await graphqlEngine.ready

  return graphqlEngine
}

let memoizedGraphqlEnginePromise: Promise<GraphQLEngineType> | null = null
const originToGraphqlEnginePromise = new Map<
  string,
  Promise<GraphQLEngineType> | null | Error
>()

function tryToInitializeGraphqlEngineFromCollectedOrigins(): Promise<GraphQLEngineType> {
  for (const [origin, originEngineState] of originToGraphqlEnginePromise) {
    if (!(originEngineState instanceof Error)) {
      if (originEngineState === null) {
        const engineForOriginPromise = initializeGraphqlEngine(origin).catch(
          e => {
            originToGraphqlEnginePromise.set(
              origin,
              e instanceof Error ? e : new Error(e)
            )

            if (e.downloadError) {
              return tryToInitializeGraphqlEngineFromCollectedOrigins()
            }

            throw e
          }
        )
        originToGraphqlEnginePromise.set(origin, engineForOriginPromise)
        return engineForOriginPromise
      } else {
        return originEngineState
      }
    }
  }

  return Promise.reject(new Error(`No engine available`))
}

function memoizedInitializeGraphqlEngine(
  origin: string
): Promise<GraphQLEngineType> {
  if (!originToGraphqlEnginePromise.has(origin)) {
    // register origin, but for now don't init anything
    originToGraphqlEnginePromise.set(origin, null)
  }

  if (!memoizedGraphqlEnginePromise) {
    // pick first non-errored entry
    memoizedGraphqlEnginePromise =
      tryToInitializeGraphqlEngineFromCollectedOrigins().catch(e => {
        // at this point we don't have any origin that work, but maybe we will get one in future
        // so unset memoizedGraphqlEnginePromise as it would be not allowing any more attempts once it settled
        memoizedGraphqlEnginePromise = null
        throw e
      })
  }
  return memoizedGraphqlEnginePromise
}

memoizedInitializeGraphqlEngine(cdnDatastoreOrigin).catch(
  () =>
    // we don't want to crash the process if we can't get the engine without a request
    null
)

function reverseFixedPagePath(pageDataRequestPath: string): string {
  return pageDataRequestPath === `index` ? `/` : pageDataRequestPath
}

function getPathInfo(requestPath: string):
  | {
      isPageData: boolean
      pagePath: string
    }
  | undefined {
  const matches = requestPath.matchAll(/^\/?page-data\/(.+)\/page-data.json$/gm)
  for (const [, requestedPagePath] of matches) {
    return {
      isPageData: true,
      pagePath: reverseFixedPagePath(requestedPagePath),
    }
  }

  // if not matched
  return {
    isPageData: false,
    pagePath: requestPath,
  }
}

function setStatusAndHeaders({
  page,
  data,
  res,
}: {
  page: EnginePage
  data: ISSRData
  res: GatsbyFunctionResponse
}): void {
  if (page.mode === `SSR`) {
    if (data.serverDataStatus) {
      res.status(data.serverDataStatus)
    }
  }
  if (data.serverDataHeaders) {
    for (const [name, value] of Object.entries(data.serverDataHeaders)) {
      res.setHeader(name, value)
    }
  }
}

function getErrorBody(statusCode: number): string {
  let body = `<html><body><h1>${statusCode}</h1><p>${
    statusCode === 404 ? `Not found` : `Internal Server Error`
  }</p></body></html>`

  if (statusCode === 404 || statusCode === 500) {
    const filename = path.join(process.cwd(), `public`, `${statusCode}.html`)

    if (fs.existsSync(filename)) {
      body = fs.readFileSync(filename, `utf8`)
    }
  }

  return body
}

interface IPageInfo {
  page: EnginePage
  isPageData: boolean
  pagePath: string
}

function getPage(pathname: string): IPageInfo | undefined {
  const pathInfo = getPathInfo(pathname)
  if (!pathInfo) {
    return undefined
  }

  const { isPageData, pagePath } = pathInfo

  const page = findEnginePageByPath(pagePath)
  if (!page) {
    return undefined
  }

  return {
    page,
    isPageData,
    pagePath,
  }
}

async function engineHandler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
): Promise<void> {
  try {
    let pageInfo: IPageInfo | undefined

    const originalPathName = req.url ?? ``

    if (PATH_PREFIX && originalPathName.startsWith(PATH_PREFIX)) {
      const maybePath = originalPathName.slice(PATH_PREFIX.length)
      pageInfo = getPage(maybePath)
    }

    if (!pageInfo) {
      pageInfo = getPage(originalPathName)
    }

    if (!pageInfo) {
      res.status(404).send(getErrorBody(404))
      return
    }

    const { pagePath, isPageData, page } = pageInfo

    const data = await getData({
      pathName: pagePath,
      getGraphqlEngine: () =>
        memoizedInitializeGraphqlEngine(
          req?.rawUrl ? new URL(req.rawUrl).origin : cdnDatastoreOrigin
        ),
      req,
    })

    if (isPageData) {
      const results = await renderPageData({ data })
      setStatusAndHeaders({ page, data, res })
      res.json(results)
      return
    } else {
      const results = await renderHTML({ data })
      setStatusAndHeaders({ page, data, res })
      res.send(results)
      return
    }
  } catch (e) {
    console.error(`Engine failed to handle request`, e)
    res.status(500).send(getErrorBody(500))
  }
}

export default engineHandler
