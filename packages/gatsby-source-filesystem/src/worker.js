const path = require(`path`)
const fs = require(`fs-extra`)
const mime = require(`mime`)
const crypto = require('crypto')

const md5File = require(`md5-file`)

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

// Web worker path
if (typeof Worker !== "undefined" && !isMainThread) {
  const { i } = workerData // Data that was passed in constructor of Worker
  console.log("Worker " + i + "; listening")

  parentPort.on("message", msg => {
    setImmediate(() => action(msg))
  })

  function action(msg) {
    const { fname, ext } = msg
    //console.log("Worker " + i + "; generating hash for", fname)

    if (true) {
      const hash = crypto.createHash('md5')
      const data =  fs.readFileSync(fname)
      hash.update(data);
      const contentDigest = hash.digest('hex')
      const mediaType = mime.getType(ext)
      const internal = {
        contentDigest,
        type: `File`,
        mediaType: mediaType ? mediaType : `application/octet-stream`,
        description: `File "${path.relative(process.cwd(), fname)}"`,
      }

      //console.log("Worker " + i + "; sending generated hash")

      parentPort.postMessage(internal)

    } else if (true) {
      const contentDigest = md5File.sync(fname);
      const mediaType = mime.getType(ext)
      const internal = {
        contentDigest,
        type: `File`,
        mediaType: mediaType ? mediaType : `application/octet-stream`,
        description: `File "${path.relative(process.cwd(), fname)}"`,
      }

      //console.log("Worker " + i + "; sending generated hash")

      parentPort.postMessage(internal)
    } else {
      md5File(fname).then(contentDigest => {
        const mediaType = mime.getType(ext)
        const internal = {
          contentDigest,
          type: `File`,
          mediaType: mediaType ? mediaType : `application/octet-stream`,
          description: `File "${path.relative(process.cwd(), fname)}"`,
        }

        //console.log("Worker " + i + "; sending generated hash")

        parentPort.postMessage(internal)
      })
    }
  }
}
