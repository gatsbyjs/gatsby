const { default: PQueue } = require("p-queue")
const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)
const Bottleneck = require(`bottleneck`)
const http = require(`http`)
const fetch = require(`@adobe/node-fetch-retry`)
const { performance } = require("perf_hooks")
const crypto = require(`crypto`)

const httpAgent = new http.Agent({
  keepAlive: true,
})

const mtimes = new Map()
const digests = new Map()
const inFlight = new Map()
async function md5File(filePath) {
  if (digests.has(filePath)) {
    return digests.get(filePath)
  }

  if (inFlight.has(filePath)) {
    return inFlight.get(filePath)
  } else {
    const md5Promise = new Promise((resolve, reject) => {
      // const newMtime = fs.statSync(filePath).mtime.getTime()
      // let renew = false
      // // Has the file changed?
      // if (mtimes.has(filePath)) {
      // if (newMtime !== mtimes.get(filePath)) {
      // renew = true
      // }
      // } else {
      // renew = true
      // }

      // mtimes.set(filePath, newMtime)

      // // If we need to renew, calculate, cache and return.
      // if (renew) {
      const output = crypto.createHash("md5")
      const input = fs.createReadStream(filePath)

      input.on("error", err => {
        reject(err)
      })

      output.once("readable", () => {
        const newDigest = output.read().toString("hex")
        digests.set(filePath, newDigest)
        resolve(newDigest)
      })

      input.pipe(output)
      // } else {
      // resolve(digests.get(path))
      // }
    })

    inFlight.set(filePath, md5Promise)
    return md5Promise
  }
}

const queue = new PQueue({ concurrency: 100 })
queue.pause()
let taskNum = 1
let taskPartDigests = new Map()
let hostHashDigest = new Set()
let taskFiles = new Map()
let startTime = 0
module.exports = function Runner(options) {
  const pool = options.pools[0]
  const WORKER_HOST = `http://localhost:${pool.httpPort}`
  const WORKER_SOCKET_HOST = `http://localhost:${pool.socketPort}`
  const socket = require(`socket.io-client`)(WORKER_SOCKET_HOST, {
    reconnect: true,
  })
  socket.on(`connect`, async function () {
    console.log(`connect to socket`)
    // socket.emit(`setTaskRunner`, fs.readFileSync(`./remote-task-runner.js`))
    // socket.on(`serverReady`, () => {
    queue.start()
    // startTime = Date.now()
    // console.log(`serverReady`)

    // socket.on(`response`, res => {
    // console.log(res)
    // })
    // })

    socket.on(`sendFile`, async file => {
      console.log(`sendFile`, file)
      file.fileBlob = await fs.readFile(file.originPath)
      socket.emit(`file`, file)
    })
  })

  const batcher = new Bottleneck.Batcher({
    maxTime: 1,
    maxSize: 80,
  })

  batcher.on(`batch`, async tasks => {
    const grouped = {}
    tasks.forEach(task => {
      if (grouped[task.digest]) {
        grouped[task.digest].tasks.push({ args: task.args, files: task.files })
      } else {
        grouped[task.digest] = {
          tasks: [{ args: task.args, files: task.files }],
          dependencies: task.dependencies,
          funcDigest: task.funcDigest,
          func: task.func,
        }
      }
    })
    const res = await fetch(WORKER_HOST, {
      method: `post`,
      body: JSON.stringify(grouped),
      agent: function (_parsedURL) {
        if (_parsedURL.protocol == "http:") {
          return httpAgent
        } else {
          return httpsAgent
        }
      },
    })
    const body = await res.json()
    console.log(`response`, { body })

    // Loop through tasks and call callback with responses.
    // TODO fix ordering?
    body.forEach((res, i) => tasks[i].callback(res))
  })

  const runTask = async task => {
    let outsideResolve
    const taskPromise = new Promise(resolve => {
      outsideResolve = resolve
    })
    // preprocess and then add to the queue
    const taskFn = () => {
      return new Promise(async resolve => {
        const start = performance.now()
        taskNum += 1
        task.id = taskNum

        if (!task.digest) {
          // Set the task digest
          const TASK_DIGEST_KEY =
            task.func.toString() + task.dependencies?.toString() || ``
          if (taskPartDigests.has(TASK_DIGEST_KEY)) {
            task.digest = taskPartDigests.get(TASK_DIGEST_KEY)
          } else {
            const taskDigest = String(murmurhash(TASK_DIGEST_KEY)).slice(0, 5)
            taskPartDigests.set(TASK_DIGEST_KEY, taskDigest)
            task.digest = taskDigest
          }
        }

        // Is the function already stored?
        if (taskPartDigests.has(task.func)) {
          task.funcDigest = taskPartDigests.get(task.func)
        } else {
          task.func = task.func.toString()
          const funcDigest = murmurhash(task.func).toString().slice(0, 5)
          taskPartDigests.set(task.func, funcDigest)
          task.funcDigest = funcDigest
        }

        // TODO send files & dependencies hash like the function hash

        // Does this host already have this function digest?
        // If so, delete the function as it's not needed.
        const func_KEY = `${WORKER_HOST}-${task.funcDigest}`
        if (hostHashDigest.has(func_KEY)) {
          delete task.func
        } else {
          hostHashDigest.add(func_KEY)
        }

        if (taskFiles.has(task.digest)) {
          task.files = taskFiles.get(task.digest)
        } else {
          if (task.files && !_.isEmpty(task.files)) {
            await Promise.all(
              _.toPairs(task.files).map(async ([name, file]) => {
                const digest = await md5File(file.originPath)
                // Discard the file path
                task.files[name] = { ...file, digest }
              })
            )
            taskFiles.set(task.digest, task.files)
          }
        }

        const end = performance.now()
        // taskPrepTimes.push(end - start)

        task.callback = response => {
          outsideResolve(response)
          resolve()
        }

        batcher.add(task)
      })
    }

    queue.add(taskFn)

    return taskPromise
  }
  return {
    runTask,
    destroy: () => socket.close(),
  }
}
