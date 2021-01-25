const fastqueue = require(`fastq`)
const Bottleneck = require(`bottleneck`)
const avro = require("avsc")
const _ = require(`lodash`)
const http = require(`http`)
const fetch = require(`@adobe/node-fetch-retry`)
const { performance } = require("perf_hooks")
const fs = require(`fs-extra`)

const httpAgent = new http.Agent({
  keepAlive: true,
})

function createRunner(options) {
  return new Promise(resolve => {
    const runner = {}
    runner.pool = options.pools[0]
    runner.WORKER_HOST = `http://localhost:${runner.pool.httpPort}`
    runner.WORKER_SOCKET_HOST = `http://localhost:${runner.pool.socketPort}`
    runner.socket = require(`socket.io-client`)(runner.WORKER_SOCKET_HOST, {
      reconnect: true,
    })

    function onConnect() {
      resolve(runner)
    }

    runner.socket.once(`connect`, onConnect)

    function setupTask(task) {
      return new Promise(async resolve => {
        if (task.files && !_.isEmpty(task.files)) {
          await Promise.all(
            _.toPairs(task.files).map(async ([name, file]) => {
              task.files[name].fileBlob = await fs.readFile(file.originPath)
            })
          )
        }
        runner.socket.emit(`setupTask`, task)

        function waitForTaskFinish() {
          resolve()
        }
        runner.socket.once(`task-setup-${task.digest}`, waitForTaskFinish)
      })
    }

    runner.setupTask = setupTask
    runner.destroy = () => socket.close()

    // Task execution
    const batchSize = 20
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
          _.mean(taskSerialize.slice(-100)),
          _.mean(taskExecutionTime.slice(-100))
        )
      }
      const start = performance.now()
      const argsType = avro.Type.forSchema(tasks[0].task.argsSchema)

      // send the minimal data
      const preppedTaskArgs = tasks.map(task => {
        const minimalTask = {
          id: task.id,
          args: task.args,
        }
        return minimalTask
      })
      const buf = argsType.toBuffer(preppedTaskArgs)
      const end = performance.now()

      taskSerialize.push(end - start)

      const res = await fetch(runner.WORKER_HOST + `/` + tasks[0].task.digest, {
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

      // We're just looking for an ok response
      if (tasks[0].task.returnOnlyErrors) {
        if (res.status == 200 && res.statusText === `OK`) {
          tasks.forEach(t => t.callback(null, `ok`))
        }
      } else {
        const body = await res.json()

        // Loop through tasks and call callback with responses.
        // TODO fix ordering?
        body.forEach((res, i) => tasks[i].callback(null, res))
      }
    })

    let taskNum = 0
    const taskSerialize = []
    const taskExecutionTime = []
    async function worker(task, cb) {
      taskNum += 1
      task.id = taskNum

      task.callback = cb

      batcher.add(task)
    }
    const queueConcurrency = 2500
    const fqueue = fastqueue(worker, queueConcurrency)
    function executeTask(task) {
      let outsideResolve
      const taskPromise = new Promise(resolve => {
        outsideResolve = resolve
      })

      fqueue.push(task, (err, result) => {
        outsideResolve(result)
      })

      return taskPromise
    }

    runner.executeTask = executeTask
  })
}

module.exports = createRunner
