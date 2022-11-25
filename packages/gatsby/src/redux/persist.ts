import path from "path"
import os from "os"
import v8 from "v8"
import {
  existsSync,
  mkdtempSync,
  moveSync, // Note: moveSync over renameSync because /tmp may be on other mount
  readFileSync,
  removeSync,
  writeFileSync,
  outputFileSync,
} from "fs-extra"
import {
  ICachedReduxState,
  IGatsbyNode,
  IGatsbyPage,
  GatsbyStateKeys,
} from "./types"
import { sync as globSync } from "glob"
import { createContentDigest } from "gatsby-core-utils"
import report from "gatsby-cli/lib/reporter"
import { DeepPartial } from "redux"

const getReduxCacheFolder = (): string =>
  // This is a function for the case that somebody does a process.chdir (#19800)
  path.join(process.cwd(), `.cache/redux`)

const getWorkerSlicesFolder = (): string =>
  // This is a function for the case that somebody does a process.chdir (#19800)
  path.join(process.cwd(), `.cache/worker`)

function reduxSharedFile(dir: string): string {
  return path.join(dir, `redux.rest.state`)
}
function reduxChunkedNodesFilePrefix(dir: string): string {
  return path.join(dir, `redux.node.state_`)
}
function reduxChunkedPagesFilePrefix(dir: string): string {
  return path.join(dir, `redux.page.state_`)
}
function reduxWorkerSlicesPrefix(dir: string): string {
  return path.join(dir, `redux.worker.slices_`)
}

export function readFromCache(
  slices?: Array<GatsbyStateKeys>,
  optionalPrefix: string = ``
): DeepPartial<ICachedReduxState> {
  // The cache is stored in two steps; the nodes and pages in chunks and the rest
  // First we revive the rest, then we inject the nodes and pages into that obj (if any)
  // Each chunk is stored in its own file, this circumvents max buffer lengths
  // for sites with a _lot_ of content. Since all nodes / pages go into a Map, the order
  // of reading them is not relevant.

  let cacheFolder = getReduxCacheFolder()

  if (slices) {
    cacheFolder = getWorkerSlicesFolder()

    return v8.deserialize(
      readFileSync(
        reduxWorkerSlicesPrefix(cacheFolder) +
          `${optionalPrefix}_` +
          createContentDigest(slices)
      )
    )
  }

  const obj: ICachedReduxState = v8.deserialize(
    readFileSync(reduxSharedFile(cacheFolder))
  )

  // Note: at 1M pages, this will be 1M/chunkSize chunks (ie. 1m/10k=100)
  const nodesChunks = globSync(
    reduxChunkedNodesFilePrefix(cacheFolder) + `*`
  ).map(file => v8.deserialize(readFileSync(file)))

  const nodes: Array<[string, IGatsbyNode]> = [].concat(...nodesChunks)

  if (!nodesChunks.length) {
    report.info(
      `Cache exists but contains no nodes. There should be at least some nodes available so it seems the cache was corrupted. Disregarding the cache and proceeding as if there was none.`
    )
    return {} as DeepPartial<ICachedReduxState>
  }

  obj.nodes = new Map(nodes)

  // Note: at 1M pages, this will be 1M/chunkSize chunks (ie. 1m/10k=100)
  const pagesChunks = globSync(
    reduxChunkedPagesFilePrefix(cacheFolder) + `*`
  ).map(file => v8.deserialize(readFileSync(file)))

  const pages: Array<[string, IGatsbyPage]> = [].concat(...pagesChunks)

  obj.pages = new Map(pages)

  return obj
}

export function guessSafeChunkSize(
  values: Array<[string, IGatsbyNode]> | Array<[string, IGatsbyPage]>,
  showMaxSizeWarning: boolean = false
): number {
  // Pick a few random elements and measure their size then pick a chunk size
  // ceiling based on the worst case. Each test takes time so there's trade-off.
  // This attempts to prevent small sites with very large pages from OOMing.
  // This heuristic could still fail if it randomly grabs the smallest nodes.
  // TODO: test a few nodes per each type instead of from all nodes

  const nodesToTest = 11 // Very arbitrary number
  const valueCount = values.length
  const step = Math.max(1, Math.ceil(valueCount / nodesToTest))
  let maxSize = 0
  for (let i = 0; i < valueCount; i += step) {
    const size = v8.serialize(values[i]).length
    maxSize = Math.max(size, maxSize)
  }

  // Sends a warning once if any of the chunkSizes exceeds approx 500kb limit
  if (showMaxSizeWarning && maxSize > 500000) {
    report.warn(
      `The size of at least one page context chunk exceeded 500kb, which could lead to degraded performance. Consider putting less data in the page context.`
    )
  }

  // Max size of a Buffer is 2gb (yeah, we're assuming 64bit system)
  // https://stackoverflow.com/questions/8974375/whats-the-maximum-size-of-a-node-js-buffer
  // Use 1.5gb as the target ceiling, allowing for some margin of error
  return Math.floor((1.5 * 1024 * 1024 * 1024) / maxSize)
}

function prepareCacheFolder(
  targetDir: string,
  contents: DeepPartial<ICachedReduxState>
): void {
  // Temporarily save the nodes and pages and remove them from the main redux store
  // This prevents an OOM when the page nodes collectively contain too much data
  const nodesMap = contents.nodes
  contents.nodes = undefined

  const pagesMap = contents.pages
  contents.pages = undefined

  writeFileSync(reduxSharedFile(targetDir), v8.serialize(contents))

  // Now restore them on the redux store
  contents.nodes = nodesMap
  contents.pages = pagesMap

  if (nodesMap) {
    if (nodesMap.size === 0) {
      // Nodes are actually stored in LMDB.
      // But we need at least one node in redux state to workaround the warning above:
      // "Cache exists but contains no nodes..." (when loading cache).
      const dummyNode: IGatsbyNode = {
        id: `dummy-node-id`,
        parent: ``,
        children: [],
        internal: {
          type: `DummyNode`,
          contentDigest: `dummy-node`,
          counter: 0,
          owner: ``,
        },
        fields: [],
      }
      nodesMap.set(dummyNode.id, dummyNode)
    }
    // Now store the nodes separately, chunk size determined by a heuristic
    const values: Array<[string, IGatsbyNode]> = [...nodesMap.entries()]
    const chunkSize = guessSafeChunkSize(values)
    const chunks = Math.ceil(values.length / chunkSize)

    for (let i = 0; i < chunks; ++i) {
      writeFileSync(
        reduxChunkedNodesFilePrefix(targetDir) + i,
        v8.serialize(values.slice(i * chunkSize, i * chunkSize + chunkSize))
      )
    }
  }

  if (pagesMap) {
    // Now store the nodes separately, chunk size determined by a heuristic
    const values: Array<[string, IGatsbyPage]> = [...pagesMap.entries()]
    const chunkSize = guessSafeChunkSize(values, true)
    const chunks = Math.ceil(values.length / chunkSize)

    for (let i = 0; i < chunks; ++i) {
      writeFileSync(
        reduxChunkedPagesFilePrefix(targetDir) + i,
        v8.serialize(values.slice(i * chunkSize, i * chunkSize + chunkSize))
      )
    }
  }
}

function safelyRenameToBak(cacheFolder: string): string {
  // Basically try to work around the potential of previous renamed caches
  // not being removed for whatever reason. _That_ should not be a blocker.
  const tmpSuffix = `.bak`
  let suffixCounter = 0
  let bakName = cacheFolder + tmpSuffix // Start without number

  while (existsSync(bakName)) {
    ++suffixCounter
    bakName = cacheFolder + tmpSuffix + suffixCounter
  }
  moveSync(cacheFolder, bakName)

  return bakName
}

export function writeToCache(
  contents: DeepPartial<ICachedReduxState>,
  slices?: Array<GatsbyStateKeys>,
  optionalPrefix: string = ``
): void {
  // Writing the "slices" also to the "redux" folder introduces subtle bugs when
  // e.g. the whole folder gets replaced some "slices" are lost
  // Thus they get written to dedicated "worker" folder
  if (slices) {
    const cacheFolder = getWorkerSlicesFolder()

    outputFileSync(
      reduxWorkerSlicesPrefix(cacheFolder) +
        `${optionalPrefix}_` +
        createContentDigest(slices),
      v8.serialize(contents)
    )
    return
  }

  // Note: this should be a transactional operation. So work in a tmp dir and
  // make sure the cache cannot be left in a corruptable state due to errors.

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), `reduxcache`)) // linux / windows

  prepareCacheFolder(tmpDir, contents)

  // Replace old cache folder with new. If the first rename fails, the cache
  // is just stale. If the second rename fails, the cache is empty. In either
  // case the cache is not left in a corrupt state.

  const reduxCacheFolder = getReduxCacheFolder()

  let bakName = ``
  if (existsSync(reduxCacheFolder)) {
    // Don't drop until after swapping over (renaming is less likely to fail)
    bakName = safelyRenameToBak(reduxCacheFolder)
  }

  // The redux cache folder should now not exist so we can rename our tmp to it
  moveSync(tmpDir, reduxCacheFolder)

  // Now try to yolorimraf the old cache folder
  try {
    if (bakName !== ``) {
      removeSync(bakName)
    }
  } catch (e) {
    report.warn(
      `Non-fatal: Deleting the old cache folder failed, left behind in \`${bakName}\`. Rimraf reported this error: ${e}`
    )
  }
}
