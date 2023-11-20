import type { GatsbyFunctionResponse, GatsbyFunctionRequest } from "gatsby"
import * as path from "path"
import * as fs from "fs-extra"
import { get as httpsGet } from "https"
import { get as httpGet, IncomingMessage, ClientRequest } from "http"
import { tmpdir } from "os"
import { pipeline } from "stream"
import { URL } from "url"
import { promisify } from "util"

import type { IGatsbyPage } from "../../internal"
import type { ISSRData } from "./entry"
import { link } from "linkfs"

const cdnDatastore = `%CDN_DATASTORE_PATH%`
const PATH_PREFIX = `%PATH_PREFIX%`

function setupFsWrapper(): string {
  // setup global._fsWrapper
  try {
    fs.accessSync(__filename, fs.constants.W_OK)
    // TODO: this seems funky - not sure if this is correct way to handle this, so just marking TODO to revisit this
    return path.join(__dirname, `..`, `data`, `datastore`)
  } catch (e) {
    // we are in a read-only filesystem, so we need to use a temp dir

    const TEMP_DIR = path.join(tmpdir(), `gatsby`)
    const TEMP_CACHE_DIR = path.join(TEMP_DIR, `.cache`)

    global.__GATSBY = {
      root: TEMP_DIR,
      buildId: ``,
    }

    // TODO: don't hardcode this
    const cacheDir = `/var/task/.cache`

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
    // Alias the cache dir paths to the temp dir
    const lfs = link(fs, rewrites) as typeof import("fs")

    // linkfs doesn't pass across the `native` prop, which graceful-fs needs
    for (const key in lfs) {
      if (Object.hasOwnProperty.call(fs[key], `native`)) {
        lfs[key].native = fs[key].native
      }
    }

    const dbPath = path.join(TEMP_CACHE_DIR, `data`, `datastore`)

    // 'promises' is not initially linked within the 'linkfs'
    // package, and is needed by underlying Gatsby code (the
    // @graphql-tools/code-file-loader)
    lfs.promises = link(fs.promises, rewrites)

    // Gatsby uses this instead of fs if present
    // eslint-disable-next-line no-underscore-dangle
    global._fsWrapper = lfs

    if (!cdnDatastore) {
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

const dbPath = setupFsWrapper()

// using require instead of import here for now because of type hell + import path doesn't exist in current context
// as this file will be copied elsewhere

type GraphQLEngineType =
  import("../../schema/graphql-engine/entry").GraphQLEngine

const { GraphQLEngine } =
  require(`../query-engine`) as typeof import("../../schema/graphql-engine/entry")

const { getData, renderPageData, renderHTML } =
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

async function getEngine(): Promise<GraphQLEngineType> {
  if (cdnDatastore) {
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
          reject(
            new Error(
              `Failed to download ${cdnDatastore}: ${response.statusCode} ${
                response.statusMessage || ``
              }`
            )
          )
          return
        }

        const fileStream = fs.createWriteStream(downloadPath)
        streamPipeline(response, fileStream)
          .then(resolve)
          .catch(error => {
            console.log(`Error downloading ${cdnDatastore}`, error)
            reject(error)
          })
      })

      req.on(`error`, error => {
        console.log(`Error downloading ${cdnDatastore}`, error)
        reject(error)
      })
    })
    console.log(`Downloaded datastore from CDN`)
  }

  const graphqlEngine = new GraphQLEngine({
    dbPath,
  })

  await graphqlEngine.ready

  return graphqlEngine
}

const engineReadyPromise = getEngine()

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
  page: IGatsbyPage
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
  page: IGatsbyPage
  isPageData: boolean
  pagePath: string
}

function getPage(
  pathname: string,
  graphqlEngine: GraphQLEngineType
): IPageInfo | undefined {
  const pathInfo = getPathInfo(pathname)
  if (!pathInfo) {
    return undefined
  }

  const { isPageData, pagePath } = pathInfo

  const page = graphqlEngine.findPageByPath(pagePath)
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
    const graphqlEngine = await engineReadyPromise
    let pageInfo: IPageInfo | undefined

    const originalPathName = req.url ?? ``

    if (PATH_PREFIX && originalPathName.startsWith(PATH_PREFIX)) {
      const maybePath = originalPathName.slice(PATH_PREFIX.length)
      pageInfo = getPage(maybePath, graphqlEngine)
    }

    if (!pageInfo) {
      pageInfo = getPage(originalPathName, graphqlEngine)
    }

    if (!pageInfo) {
      res.status(404).send(getErrorBody(404))
      return
    }

    const { pagePath, isPageData, page } = pageInfo

    const data = await getData({
      pathName: pagePath,
      graphqlEngine,
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
