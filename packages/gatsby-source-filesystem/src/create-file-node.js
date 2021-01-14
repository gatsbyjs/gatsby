const path = require(`path`)
const fs = require(`fs-extra`)
const mime = require(`mime`)
const prettyBytes = require(`pretty-bytes`)

const md5File = require(`md5-file`)
const { createContentDigest, slash } = require(`gatsby-core-utils`)

let Worker, isMainThread, parentPort, workerData
try {
  // worker_threads is node 10.15 ...
  ;({
    Worker,
    isMainThread,
    parentPort,
    workerData,
  } = require("worker_threads"))
} catch (e) {
  console.info(
    "Not using threads to generate file digests. This requires node >= 10.15, currently on " +
      process.version
  )
}

const pool = []
const all = [] // Reference so we can terminate them
if (process.env.DW) {
  const count = +process.env.DW
  console.log("Creating", count, "workers now")
  Array(+process.env.DW)
    .fill()
    .forEach((_, i) => {
      const worker = new Worker(path.join(__dirname, "worker.js"), {
        workerData: { i },
        //resourceLimits: {
        //  maxOldGenerationSizeMb: 5000,
        //  maxYoungGenerationSizeMb: 5000,
        //}
      })
      const pod = {
        i,
        worker,
        resolve: undefined, // callback set by a task that uses this worker
        reject: undefined, // callback set by a task that uses this worker
      };
      worker.on('message', msg => {
        // "complete"
        pod.resolve(msg)
        pool.push(pod)
        redrain()
      })
      worker.on("error", e => {
        console.error("The error is:")
        console.error(e)
        pool.push(pod)
        pod.reject(e)
      })
      pool.push(pod)
      all.push(pod)
    })
}

const queue = []
function queueFile(fname, ext) {
  return new Promise((resolve, reject) => {
    queue.push({ fname, ext, resolve, reject })
    redrain()
  })
}
function redrain() {
  if (pool.length && queue.length) {
    const pod = pool.pop()
    const { fname, ext, resolve, reject } = queue.pop()
    //console.log("sending work to worker", i, "->", fname)
    pod.worker.postMessage({ fname, ext })
    pod.resolve = resolve
    pod.reject = reject
  }
}

exports.createFileNode = async (
  pathToFile,
  createNodeId,
  pluginOptions = {}
) => {
  const slashed = slash(pathToFile)
  const parsedSlashed = path.parse(slashed)
  const slashedFile = {
    ...parsedSlashed,
    absolutePath: slashed,
    // Useful for limiting graphql query with certain parent directory
    relativeDirectory: slash(
      path.relative(pluginOptions.path || process.cwd(), parsedSlashed.dir)
    ),
  }

  const stats = await fs.stat(slashedFile.absolutePath)
  let internal
  if (stats.isDirectory()) {
    const contentDigest = createContentDigest({
      stats: stats,
      absolutePath: slashedFile.absolutePath,
    })
    internal = {
      contentDigest,
      type: `Directory`,
      description: `Directory "${path.relative(process.cwd(), slashed)}"`,
    }
  } else {
    console.timeSumCount('md5file')
    if (process.env.DW) {
      internal = await queueFile(slashedFile.absolutePath, slashedFile.ext)
    } else {
      const contentDigest = await md5File(slashedFile.absolutePath)
      //const contentDigest = String(Math.random()).slice(2) // await md5File(slashedFile.absolutePath)
      const mediaType = mime.getType(slashedFile.ext)
      internal = {
        contentDigest,
        type: `File`,
        mediaType: mediaType ? mediaType : `application/octet-stream`,
        description: `File "${path.relative(process.cwd(), slashed)}"`,
      }
    }
  }

  return {
    // Don't actually make the File id the absolute path as otherwise
    // people will use the id for that and ids shouldn't be treated as
    // useful information.
    id: createNodeId(pathToFile),
    children: [],
    parent: null,
    internal,
    sourceInstanceName: pluginOptions.name || `__PROGRAMMATIC__`,
    relativePath: slash(
      path.relative(
        pluginOptions.path || process.cwd(),
        slashedFile.absolutePath
      )
    ),
    extension: slashedFile.ext.slice(1).toLowerCase(),
    prettySize: prettyBytes(stats.size),
    modifiedTime: stats.mtime.toJSON(),
    accessTime: stats.atime.toJSON(),
    changeTime: stats.ctime.toJSON(),
    birthTime: stats.birthtime.toJSON(),
    // Note: deprecate splatting the slashedFile object
    // Note: the object may contain different properties depending on File or Dir
    ...slashedFile,
    // TODO: deprecate copying the entire object
    // Note: not splatting for perf reasons (make sure Date objects are serialized)
    dev: stats.dev,
    mode: stats.mode,
    nlink: stats.nlink,
    uid: stats.uid,
    rdev: stats.rdev,
    blksize: stats.blksize,
    ino: stats.ino,
    size: stats.size,
    blocks: stats.blocks,
    atimeMs: stats.atimeMs,
    mtimeMs: stats.mtimeMs,
    ctimeMs: stats.ctimeMs,
    birthtimeMs: stats.birthtimeMs,
    atime: stats.atime.toJSON(),
    mtime: stats.mtime.toJSON(),
    ctime: stats.ctime.toJSON(),
    birthtime: stats.birthtime.toJSON(),
  }
}
