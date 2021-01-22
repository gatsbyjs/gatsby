const fastqueue = require(`fastq`)
const Bottleneck = require(`bottleneck`)
const avro = require("avsc")
const _ = require(`lodash`)
const http = require(`http`)
const fetch = require(`@adobe/node-fetch-retry`)
const { performance } = require("perf_hooks")

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
      return new Promise(resolve => {
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
    const batchSize = 50
    const batcher = new Bottleneck.Batcher({
      maxTime: 1,
      maxSize: batchSize,
    })

    let batchesCount = 0
    batcher.on(`batch`, async tasks => {
      console.log({ tasks })
      batchesCount += 1
      if (batchesCount % 100 === 0) {
        console.log(
          `sent ${batchesCount} batches and ${batchesCount * batchSize} tasks`,
          _.mean(taskPrepTimes.slice(-100)),
          _.mean(taskSerialize.slice(-100)),
          _.mean(taskExecutionTime.slice(-100))
        )
      }
      console.log(`hi`)
      console.log(tasks[0].task.argsSchema)
      const start = performance.now()
      // const arrayType = {
      // type: `array`,
      // items: tasks[0].task.argsSchema,
      // }
      // console.log({ arrayType: JSON.stringify(arrayType) })
      const argsType = avro.Type.forSchema(tasks[0].task.argsSchema)
      console.log(`hi2`)
      console.log(argsType)
      // Send the minimal data
      const preppedTaskArgs = tasks.map(task => {
        const minimalTask = {
          id: task.id,
          args: task.args,
        }
        return minimalTask
      })
      console.log(preppedTaskArgs)
      const buf = argsType.toBuffer(preppedTaskArgs)
      const end = performance.now()
      console.log(buf.toString())
      console.log(argsType.fromBuffer(buf))

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
      const body = await res.json()
      console.log({ body })

      // taskExecutionTime.push(body[0].executionTime)
      // taskExecutionTime.push(body[20].executionTime)
      // taskExecutionTime.push(body.slice(-1)[0].executionTime)

      // Loop through tasks and call callback with responses.
      // TODO fix ordering?
      body.forEach((res, i) => tasks[i].callback(null, res))
    })

    let taskNum = 0
    const taskPrepTimes = []
    const taskSerialize = []
    const taskExecutionTime = []
    async function worker(task, cb) {
      const start = performance.now()
      taskNum += 1
      task.id = taskNum

      const end = performance.now()

      taskPrepTimes.push(end - start)

      task.callback = cb
      console.log(task)

      batcher.add(task)
    }
    const fqueue = fastqueue(worker, 1800)
    function executeTask(task) {
      let outsideResolve
      const taskPromise = new Promise(resolve => {
        outsideResolve = resolve
      })

      fqueue.push(task, (err, result) => {
        console.log({ err, result })
        outsideResolve(result)
      })

      return taskPromise
    }

    runner.executeTask = executeTask
  })
}

module.exports = createRunner
