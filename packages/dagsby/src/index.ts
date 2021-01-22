const { default: PQueue } = require("p-queue")
const fastqueue = require(`fastq`)
const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)
const Bottleneck = require(`bottleneck`)
const http = require(`http`)
const fetch = require(`@adobe/node-fetch-retry`)
const { performance } = require("perf_hooks")
const avro = require("avsc")

const prepareFiles = require(`./prepare-files`)
const createTask = require(`./create-task`)
const createRunner = require(`./create-runner`)

module.exports = { createTask, createRunner }

const httpAgent = new http.Agent({
  keepAlive: true,
})

const taskPrepTimes = []
const taskSerialize = []
const taskExecutionTime = []

const queue = new PQueue({ concurrency: 1000 })
queue.pause()
let taskNum = 1
let taskPartDigests = new Map()
let hostHashDigest = new Set()
let startTime = 0
let taskFiles = new Map()

function dagsby(options) {
  const pool = options.pools[0]
  const WORKER_HOST = `http://localhost:${pool.httpPort}`
  const WORKER_SOCKET_HOST = `http://localhost:${pool.socketPort}`
  const socket = require(`socket.io-client`)(WORKER_SOCKET_HOST, {
    reconnect: true,
  })
  socket.on(`connect`, async function () {
    // socket.emit(`setTaskRunner`, fs.readFileSync(`./remote-task-runner.js`))
    // socket.on(`serverReady`, () => {
    queue.start()
    fqueue.resume()
    // startTime = Date.now()

    // socket.on(`response`, res => {
    // console.log(res)
    // })
    // })

    socket.on(`sendFile`, async file => {
      file.fileBlob = await fs.readFile(file.originPath)
      socket.emit(`file`, file)
    })
  })

  const fqueue = fastqueue(worker, 1800)
  fqueue.pause()
  async function worker(task, cb) {
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
    const funcKey = task.func.toString()
    if (taskPartDigests.has(funcKey)) {
      task.funcDigest = taskPartDigests.get(funcKey)
    } else {
      task.func = task.func.toString()
      const funcDigest = murmurhash(task.func).toString().slice(0, 5)
      taskPartDigests.set(funcKey, funcDigest)
      task.funcDigest = funcDigest
    }

    // TODO send files & dependencies hash like the function hash

    // Does this host already have this function digest?
    // If so, delete the function as it's not needed.
    const func_KEY = `${WORKER_HOST}-${task.funcDigest}`
    if (hostHashDigest.has(func_KEY)) {
      task.func = ``
    } else {
      hostHashDigest.add(func_KEY)
    }

    if (taskFiles.get(task.digest)) {
      task.files = taskFiles.get(task.digest)
    } else {
      task = await prepareFiles(task)
      taskFiles.set(task.digest, task.files)
    }

    // Is the schema already created & sent?
    const schemaKey = task.digest + `schema`
    const typeKey = task.digest + `type`
    if (!taskPartDigests.has(typeKey)) {
      const taskType = avro.Type.forValue([task])
      taskPartDigests.set(typeKey, taskType)
      taskPartDigests.set(schemaKey, taskType.toString())
    }

    const end = performance.now()

    taskPrepTimes.push(end - start)

    task.callback = cb

    batcher.add(task)
  }

  const batchSize = 50
  const batcher = new Bottleneck.Batcher({
    maxTime: 1,
    maxSize: batchSize,
  })

  let batchesCount = 0
  batcher.on(`batch`, async tasks => {
    batchesCount += 1
    if (batchesCount % 100 === 0) {
      console.log(
        `sent ${batchesCount} batches and ${batchesCount * batchSize} tasks`,
        _.mean(taskPrepTimes.slice(-100)),
        _.mean(taskSerialize.slice(-100)),
        _.mean(taskExecutionTime.slice(-100))
      )
    }
    // const grouped = {}

    // tasks.forEach(task => {
    // if (grouped[task.digest]) {
    // grouped[task.digest].tasks.push({ args: task.args, files: task.files })
    // } else {
    // grouped[task.digest] = {
    // tasks: [{ args: task.args, files: task.files }],
    // dependencies: task.dependencies,
    // funcDigest: task.funcDigest,
    // func: task.func,
    // }
    // }
    // })
    // console.log(tasks)
    // console.log(`WHY 1`)
    const schemaKey = tasks[0].digest + `schema`
    // console.log(`WHY 1.4`)
    const typeKey = tasks[0].digest + `type`
    // console.log(`WHY 1.7`)
    const hostSchemaKey = schemaKey + WORKER_HOST
    // console.log(`WHY 2`)
    const start = performance.now()
    const buf = taskPartDigests.get(typeKey).toBuffer(tasks)
    const end = performance.now()

    taskSerialize.push(end - start)
    // const decodedTasks = taskPartDigests.get(typeKey).fromBuffer(buf)
    // console.log(`decoded tasks`, decodedTasks)
    // console.log(`tasks length`, buf.length)
    // If the host doesn't yet have the schema, send it first
    if (!taskPartDigests.has(hostSchemaKey)) {
      // console.log(`sending schema`, taskPartDigests.get(schemaKey))
      await fetch(WORKER_HOST + `/schema`, {
        method: `post`,
        body: JSON.stringify({
          digest: tasks[0].digest,
          schema: taskPartDigests.get(schemaKey),
        }),
        agent: function (_parsedURL) {
          if (_parsedURL.protocol == "http:") {
            return httpAgent
          } else {
            return httpsAgent
          }
        },
      })
    }

    const res = await fetch(WORKER_HOST, {
      method: `post`,
      body: buf,
      agent: function (_parsedURL) {
        if (_parsedURL.protocol == "http:") {
          return httpAgent
        } else {
          return httpsAgent
        }
      },
    })
    const body = await res.json()

    taskExecutionTime.push(body[0].executionTime)
    taskExecutionTime.push(body[20].executionTime)
    taskExecutionTime.push(body.slice(-1)[0].executionTime)

    // Loop through tasks and call callback with responses.
    // TODO fix ordering?
    body.forEach((res, i) => tasks[i].callback(null, res))
  })

  const runTask = async task => {
    let outsideResolve
    const taskPromise = new Promise(resolve => {
      outsideResolve = resolve
    })

    fqueue.push(task, (err, result) => {
      outsideResolve(result)
    })
    // preprocess and then add to the queue
    // const taskFn = () => {
    // return new Promise(async resolve => {
    // const start = performance.now()
    // taskNum += 1
    // task.id = taskNum

    // if (!task.digest) {
    // // Set the task digest
    // const TASK_DIGEST_KEY =
    // task.func.toString() + task.dependencies?.toString() || ``
    // if (taskPartDigests.has(TASK_DIGEST_KEY)) {
    // task.digest = taskPartDigests.get(TASK_DIGEST_KEY)
    // } else {
    // const taskDigest = String(murmurhash(TASK_DIGEST_KEY)).slice(0, 5)
    // taskPartDigests.set(TASK_DIGEST_KEY, taskDigest)
    // task.digest = taskDigest
    // }
    // }

    // // Is the function already stored?
    // const funcKey = task.func.toString()
    // if (taskPartDigests.has(funcKey)) {
    // task.funcDigest = taskPartDigests.get(funcKey)
    // } else {
    // task.func = task.func.toString()
    // const funcDigest = murmurhash(task.func).toString().slice(0, 5)
    // taskPartDigests.set(funcKey, funcDigest)
    // task.funcDigest = funcDigest
    // }

    // // TODO send files & dependencies hash like the function hash

    // // Does this host already have this function digest?
    // // If so, delete the function as it's not needed.
    // const func_KEY = `${WORKER_HOST}-${task.funcDigest}`
    // if (hostHashDigest.has(func_KEY)) {
    // task.func = ``
    // } else {
    // hostHashDigest.add(func_KEY)
    // }

    // if (taskFiles.get(task.digest)) {
    // task.files = taskFiles.get(task.digest)
    // } else {
    // task = await prepareFiles(task)
    // taskFiles.set(task.digest, task.files)
    // }

    // // Is the schema already created & sent?
    // const schemaKey = task.digest + `schema`
    // const typeKey = task.digest + `type`
    // if (!taskPartDigests.has(typeKey)) {
    // const taskType = avro.Type.forValue([task])
    // taskPartDigests.set(typeKey, taskType)
    // taskPartDigests.set(schemaKey, taskType.toString())
    // }

    // const end = performance.now()

    // taskPrepTimes.push(end - start)

    // task.callback = response => {
    // outsideResolve(response)
    // resolve()
    // }

    // batcher.add(task)
    // })
    // }

    // queue.add(taskFn)

    return taskPromise
  }
  return {
    createTask,
    createRunner,
  }
}
