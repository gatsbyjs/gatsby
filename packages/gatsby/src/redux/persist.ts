import path from "path"
import v8 from "v8"
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  removeSync,
  renameSync,
  writeFileSync,
} from "fs-extra"
import { IReduxNode, ICachedReduxState } from "./types"
import { sync as globSync } from "glob"
import report from "gatsby-cli/lib/reporter"

const getLegacyCacheFile = (): string =>
  // TODO: remove this legacy stuff in v3 (fairly benign change but still)
  // This is a function for the case that somebody does a process.chdir (#19800)
  path.join(process.cwd(), `.cache/redux.state`)

const getReduxCacheFolder = (): string =>
  // This is a function for the case that somebody does a process.chdir (#19800)
  path.join(process.cwd(), `.cache/redux`)

function reduxSharedFile(dir: string): string {
  return path.join(dir, `redux.rest.state`)
}
function reduxChunkedNodesFilePrefix(dir: string): string {
  return path.join(dir, `redux.node.state_`)
}

function readFromLegacyCache(): ICachedReduxState {
  return v8.deserialize(readFileSync(getLegacyCacheFile()))
}

export function readFromCache(): ICachedReduxState {
  // The cache is stored in two steps; the nodes in chunks and the rest
  // First we revive the rest, then we inject the nodes into that obj (if any)
  // Each chunk is stored in its own file, this circumvents max buffer lengths
  // for sites with a _lot_ of content. Since all nodes go into a Map, the order
  // of reading them is not relevant.

  const reduxCacheFolder = getReduxCacheFolder()

  if (!existsSync(reduxCacheFolder)) {
    return readFromLegacyCache()
  }

  const obj: ICachedReduxState = v8.deserialize(
    readFileSync(reduxSharedFile(reduxCacheFolder))
  )

  // Note: at 1M pages, this will be 1M/chunkSize chunks (ie. 1m/10k=100)
  const chunks = globSync(
    reduxChunkedNodesFilePrefix(reduxCacheFolder) + `*`
  ).map(file => v8.deserialize(readFileSync(file)))

  const nodes: [string, IReduxNode][] = [].concat(...chunks)

  if (!chunks.length) {
    report.info(
      `Cache exists but contains no nodes. There should be at least some nodes available so it seems the cache was corrupted. Disregarding the cache and proceeding as if there was none.`
    )
    // TODO: this is a DeepPartial<ICachedReduxState> but requires a big change
    return {} as ICachedReduxState
  }

  obj.nodes = new Map(nodes)

  return obj
}

function guessSafeChunkSize(values: [string, IReduxNode][]): number {
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

  // Max size of a Buffer is 2gb (yeah, we're assuming 64bit system)
  // https://stackoverflow.com/questions/8974375/whats-the-maximum-size-of-a-node-js-buffer
  // Use 1.5gb as the target ceiling, allowing for some margin of error
  return Math.floor((1.5 * 1024 * 1024 * 1024) / maxSize)
}

function prepareCacheFolder(
  targetDir: string,
  contents: ICachedReduxState
): void {
  // Temporarily save the nodes and remove them from the main redux store
  // This prevents an OOM when the page nodes collectively contain to much data
  const map = contents.nodes
  contents.nodes = undefined

  writeFileSync(reduxSharedFile(targetDir), v8.serialize(contents))
  // Now restore them on the redux store
  contents.nodes = map

  if (map) {
    // Now store the nodes separately, chunk size determined by a heuristic
    const values: [string, IReduxNode][] = [...map.entries()]
    const chunkSize = guessSafeChunkSize(values)
    const chunks = Math.ceil(values.length / chunkSize)

    for (let i = 0; i < chunks; ++i) {
      writeFileSync(
        reduxChunkedNodesFilePrefix(targetDir) + i,
        v8.serialize(values.slice(i * chunkSize, i * chunkSize + chunkSize))
      )
    }
  }
}

function safelyRenameToBak(reduxCacheFolder: string): string {
  // Basically try to work around the potential of previous renamed caches
  // not being removed for whatever reason. _That_ should not be a blocker.
  const tmpSuffix = `.bak`
  let suffixCounter = 0
  let bakName = reduxCacheFolder + tmpSuffix // Start without number

  while (existsSync(bakName)) {
    ++suffixCounter
    bakName = reduxCacheFolder + tmpSuffix + suffixCounter
  }
  renameSync(reduxCacheFolder, bakName)

  return bakName
}

export function writeToCache(contents: ICachedReduxState): void {
  // Note: this should be a transactional operation. So work in a tmp dir and
  // make sure the cache cannot be left in a corruptable state due to errors.

  const tmpDir = mkdtempSync(`reduxcache`) // linux / windows

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
  renameSync(tmpDir, reduxCacheFolder)

  // Now try to yolorimraf the old cache folder
  try {
    const legacy = getLegacyCacheFile()
    if (existsSync(legacy)) {
      removeSync(legacy)
    }
    if (bakName !== ``) {
      removeSync(bakName)
    }
  } catch (e) {
    report.warn(
      `Non-fatal: Deleting the old cache folder failed, left behind in \`${bakName}\`. Rimraf reported this error: ${e}`
    )
  }
}
