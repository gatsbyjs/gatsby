import { walkStream as fsWalkStream, Entry } from "@nodelib/fs.walk"
import fs from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"
import fastq from "fastq"
import path from "path"
import { createContentDigest, generatePageDataPath } from "gatsby-core-utils"
import { websocketManager } from "./websocket-manager"
import { isWebpackStatusPending } from "./webpack-status"
import { store } from "../redux"
import { hasFlag, FLAG_DIRTY_NEW_PAGE } from "../redux/reducers/queries"
import { isLmdbStore } from "../datastore"
import type GatsbyCacheLmdb from "./cache-lmdb"
import {
  constructPageDataString,
  reverseFixedPagePath,
  IPageData,
} from "./page-data-helpers"
import { Span } from "opentracing"

export { reverseFixedPagePath }
import { processNodeManifests } from "../utils/node-manifest"
import { IExecutionResult } from "../query/types"
import { getPageMode } from "./page-mode"

export interface IPageDataWithQueryResult extends IPageData {
  result: IExecutionResult
}

export async function readPageData(
  publicDir: string,
  pagePath: string
): Promise<IPageDataWithQueryResult> {
  const filePath = generatePageDataPath(publicDir, pagePath)
  const rawPageData = await fs.readFile(filePath, `utf-8`)

  return JSON.parse(rawPageData)
}

export async function removePageData(
  publicDir: string,
  pagePath: string
): Promise<void> {
  const filePath = generatePageDataPath(publicDir, pagePath)

  if (fs.existsSync(filePath)) {
    return await fs.remove(filePath)
  }

  return Promise.resolve()
}

export function pageDataExists(publicDir: string, pagePath: string): boolean {
  return fs.existsSync(generatePageDataPath(publicDir, pagePath))
}

let lmdbPageQueryResultsCache: GatsbyCacheLmdb
function getLMDBPageQueryResultsCache(): GatsbyCacheLmdb {
  if (!lmdbPageQueryResultsCache) {
    const GatsbyCacheLmdbImpl = require(`./cache-lmdb`).default
    lmdbPageQueryResultsCache = new GatsbyCacheLmdbImpl({
      name: `internal-tmp-query-results`,
      encoding: `string`,
    }).init()
  }
  return lmdbPageQueryResultsCache
}

let savePageQueryResultsPromise = Promise.resolve()

export function waitUntilPageQueryResultsAreStored(): Promise<void> {
  return savePageQueryResultsPromise
}

export async function savePageQueryResult(
  programDir: string,
  pagePath: string,
  stringifiedResult: string
): Promise<void> {
  if (isLmdbStore()) {
    savePageQueryResultsPromise = getLMDBPageQueryResultsCache().set(
      pagePath,
      stringifiedResult
    ) as Promise<void>
  } else {
    const pageQueryResultsPath = path.join(
      programDir,
      `.cache`,
      `json`,
      `${pagePath.replace(/\//g, `_`)}.json`
    )
    await fs.outputFile(pageQueryResultsPath, stringifiedResult)
  }
}

export async function readPageQueryResult(
  publicDir: string,
  pagePath: string
): Promise<string | Buffer> {
  if (isLmdbStore()) {
    const stringifiedResult = await getLMDBPageQueryResultsCache().get(pagePath)
    if (typeof stringifiedResult === `string`) {
      return stringifiedResult
    }
    throw new Error(`Couldn't find temp query result for "${pagePath}".`)
  } else {
    const pageQueryResultsPath = path.join(
      publicDir,
      `..`,
      `.cache`,
      `json`,
      `${pagePath.replace(/\//g, `_`)}.json`
    )
    return fs.readFile(pageQueryResultsPath)
  }
}

export async function writePageData(
  publicDir: string,
  pageData: IPageData
): Promise<string> {
  const result = await readPageQueryResult(publicDir, pageData.path)

  const outputFilePath = generatePageDataPath(publicDir, pageData.path)

  const body = constructPageDataString(pageData, result)

  // transform asset size to kB (from bytes) to fit 64 bit to numbers
  const pageDataSize = Buffer.byteLength(body) / 1000

  store.dispatch({
    type: `ADD_PAGE_DATA_STATS`,
    payload: {
      pagePath: pageData.path,
      filePath: outputFilePath,
      size: pageDataSize,
      pageDataHash: createContentDigest(body),
    },
  })

  await fs.outputFile(outputFilePath, body)
  return body
}

let isFlushPending = false
let isFlushing = false

export function isFlushEnqueued(): boolean {
  return isFlushPending
}

export async function flush(parentSpan?: Span): Promise<void> {
  if (isFlushing) {
    // We're already in the middle of a flush
    return
  }
  await waitUntilPageQueryResultsAreStored()
  isFlushPending = false
  isFlushing = true
  const {
    pendingPageDataWrites,
    pages,
    program,
    staticQueriesByTemplate,
    queries,
  } = store.getState()
  const isBuild = program?._?.[0] !== `develop`

  const { pagePaths } = pendingPageDataWrites
  let writePageDataActivity

  let nodeManifestPagePathMap

  if (pagePaths.size > 0) {
    // we process node manifests in this location because we need to add the manifestId to the page data.
    // We use this manifestId to determine if the page data is up to date when routing. Here we create a map of "pagePath": "manifestId" while processing and writing node manifest files.
    // We only do this when there are pending page-data writes because otherwise we could flush pending createNodeManifest calls before page-data.json files are written. Which means those page-data files wouldn't have the corresponding manifest id's written to them.
    nodeManifestPagePathMap = await processNodeManifests()

    writePageDataActivity = reporter.createProgress(
      `Writing page-data.json files to public directory`,
      pagePaths.size,
      0,
      { id: `write-page-data-public-directory`, parentSpan }
    )
    writePageDataActivity.start()
  }

  const flushQueue = fastq(async (pagePath, cb) => {
    const page = pages.get(pagePath)

    // It's a gloomy day in Bombay, let me tell you a short story...
    // Once upon a time, writing page-data.json files were atomic
    // After this change (#24808), they are not and this means that
    // between adding a pending write for a page and actually flushing
    // them, a page might not exist anymore щ（ﾟДﾟщ）
    // This is why we need this check
    if (page) {
      if (page.path && nodeManifestPagePathMap) {
        page.manifestId = nodeManifestPagePathMap.get(page.path)
      }

      if (!isBuild && process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND) {
        // check if already did run query for this page
        // with query-on-demand we might have pending page-data write due to
        // changes in static queries assigned to page template, but we might not
        // have query result for it
        const query = queries.trackedQueries.get(page.path)
        if (!query) {
          // this should not happen ever
          throw new Error(
            `We have a page, but we don't have registered query for it (???)`
          )
        }

        if (hasFlag(query.dirty, FLAG_DIRTY_NEW_PAGE)) {
          // query results are not written yet
          setImmediate(() => cb(null, true))
          return
        }
      }

      // In develop we rely on QUERY_ON_DEMAND so we just go through
      // In build we only build these page-json for SSG pages
      if (
        _CFLAGS_.GATSBY_MAJOR !== `4` ||
        !isBuild ||
        (isBuild && getPageMode(page) === `SSG`)
      ) {
        const staticQueryHashes =
          staticQueriesByTemplate.get(page.componentPath) || []

        const result = await writePageData(
          path.join(program.directory, `public`),
          {
            ...page,
            staticQueryHashes,
          }
        )

        writePageDataActivity.tick()

        if (!isBuild) {
          websocketManager.emitPageData({
            id: pagePath,
            result: JSON.parse(result) as IPageDataWithQueryResult,
          })
        }
      }
    }

    store.dispatch({
      type: `CLEAR_PENDING_PAGE_DATA_WRITE`,
      payload: {
        page: pagePath,
      },
    })

    // `setImmediate` below is a workaround against stack overflow
    // occurring when there are many non-SSG pages
    setImmediate(() => cb(null, true))
    return
  }, 25)

  for (const pagePath of pagePaths) {
    flushQueue.push(pagePath, () => {})
  }

  if (!flushQueue.idle()) {
    await new Promise(resolve => {
      flushQueue.drain = resolve as () => unknown
    })
  }
  if (writePageDataActivity) {
    writePageDataActivity.end()
  }

  isFlushing = false

  return
}

export function enqueueFlush(parentSpan?: Span): void {
  if (isWebpackStatusPending()) {
    isFlushPending = true
  } else {
    flush(parentSpan)
  }
}

export async function handleStalePageData(parentSpan: Span): Promise<void> {
  if (!(await fs.pathExists(`public/page-data`))) {
    return
  }

  // public directory might have stale page-data files from previous builds
  // we get the list of those and compare against expected page-data files
  // and remove ones that shouldn't be there anymore

  const activity = reporter.activityTimer(`Cleaning up stale page-data`, {
    parentSpan,
  })
  activity.start()

  const pageDataFilesFromPreviousBuilds = await new Promise<Set<string>>(
    (resolve, reject) => {
      const results = new Set<string>()

      const stream = fsWalkStream(`public/page-data`)

      stream.on(`data`, (data: Entry) => {
        if (data.name === `page-data.json`) {
          results.add(data.path)
        }
      })

      stream.on(`error`, e => {
        reject(e)
      })

      stream.on(`end`, () => resolve(results))
    }
  )

  const expectedPageDataFiles = new Set<string>()
  store.getState().pages.forEach(page => {
    expectedPageDataFiles.add(generatePageDataPath(`public`, page.path))
  })

  const deletionPromises: Array<Promise<void>> = []
  pageDataFilesFromPreviousBuilds.forEach(pageDataFilePath => {
    if (!expectedPageDataFiles.has(pageDataFilePath)) {
      deletionPromises.push(fs.remove(pageDataFilePath))
    }
  })

  await Promise.all(deletionPromises)

  activity.end()
}
