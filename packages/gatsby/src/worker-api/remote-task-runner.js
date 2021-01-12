const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const path = require(`path`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)
var http = require("http")
var compress = require("compression")
const { performance } = require("perf_hooks")
var compress = require("compression")
const execa = require(`execa`)
// const { Lock: lockInner } = require("lock")
// const lockInstance = lockInner()
const lockfile = require("proper-lockfile")
const cluster = require("cluster")
const numCPUs = require("os").cpus().length
const { EventEmitter } = require("events")
const pEvent = require(`p-event`)
const top = require("process-top")()

const redis = require("redis")
const client = redis.createClient({ host: `0.0.0.0` })
client.on("error", function (error) {
  console.error(error)
})
const { promisify } = require("util")
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

// function lock(resources) {
// return new Promise(resolve =>
// lockInstance(resources, release => {
// const releaseLock = release(() => {})
// resolve(releaseLock)
// })
// )
// }

const functionDir = path.join(__dirname, `.cache`, `worker-tasks`)
const filesDir = path.join(__dirname, `.cache`, `files`)
fs.ensureDirSync(functionDir)
fs.ensureDirSync(filesDir)

var counter = 0
var port = 3001

let count = 0
let start
if (cluster.isMaster) {
  const io = require("socket.io")(3000)
  let socket
  console.log(`master pid ${process.pid}`)

  io.on("connection", sock => {
    socket = sock
    socket.emit(`serverReady`)
    // sock.on(`*`, (type, action) => {
    sock.on(`file`, async file => {
      // Make path
      const localPath = path.join(filesDir, file.digest)
      await fs.writeFile(localPath, file.fileBlob)

      const fileObject = { ...file, localPath } //, fileBlob };
      delete fileObject.fileBlob
      for (const id in cluster.workers) {
        cluster.workers[id].send({ type: file.digest, action: fileObject })
      }
    })
  })

  // Count requests
  function messageHandler(msg) {
    if (msg.cmd) {
      if (msg.cmd === `emit`) {
        console.log(`socket.io emit`)
        socket.emit(msg.emit, msg.args)
      }
      if (msg.cmd === `broadcast`) {
        for (const id in cluster.workers) {
          cluster.workers[id].send({ type: msg.msg })
        }
      }
    }
  }

  // Start workers and listen for messages containing notifyRequest
  const numCPUs = require("os").cpus().length
  for (let i = 0; i < numCPUs - 1; i++) {
    cluster.fork()
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on("message", messageHandler)
  }
  setInterval(function () {
    // Prints out a string containing stats about your Node.js process.
    console.log(`PARENT`, top.toString())
  }, 3000)
} else {
  setInterval(function () {
    // Prints out a string containing stats about your Node.js process.
    console.log(`CHILD`, top.toString())
  }, 3000)

  const parentMessages = new EventEmitter()
  process.on(`message`, msg => parentMessages.emit(msg.type, msg.action))
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http
    .createServer((req, res) => {
      var noop = function () {},
        useDefaultOptions = {}
      // compress(useDefaultOptions)(req, res, noop)
      let data = ""
      req.on("data", chunk => {
        data += chunk
      })
      req.on("end", async () => {
        const groupedTasks = JSON.parse(data)
        // Recreate shape of original task object
        const tasks = []
        Object.keys(groupedTasks).forEach(taskDigest => {
          groupedTasks[taskDigest].tasks.forEach(task => {
            const group = groupedTasks[taskDigest]
            // console.log(task, group)
            tasks.push({
              ...task,
              digest: taskDigest,
              dependencies: group.dependencies,
              funcDigest: group.funcDigest,
              func: group.func,
            })
          })
        })
        // console.log(`tasks`, tasks)
        // process.exit()
        const results = await Promise.all(tasks.map(task => runTask(task)))
        res.writeHead(200)
        res.end(JSON.stringify(results))
      })
      // Notify master about the request
      // process.send({ cmd: "notifyRequest" })
    })
    .listen(8001)

  console.log(`Worker ${process.pid} started`)
  // const files = new Map()
  // function postRequest(request, response, callback) {
  // // compress({})(request, response, () => {})
  // if (request.method == "POST") {
  // if (!start) {
  // start = Date.now()
  // }
  // // var writeStream = fs.createWriteStream("/tmp/" + ++counter + port)

  // let newFile = ``
  // request.on("data", function (data) {
  // newFile += data.toString()
  // })

  // request.on("end", function () {
  // files.set(++counter, newFile)
  // if (files.size % 100 == 0) {
  // console.log(files.size)
  // }
  // callback()
  // })
  // }
  // }

  // http
  // .createServer(function (request, response) {
  // postRequest(request, response, function () {
  // response.writeHead(200, "OK", { "Content-Type": "text/plain" })
  // count += 1
  // if (count % 100 === 0) {
  // console.log(`uploaded ${count} files`)
  // }
  // if (count === 10000) {
  // const time = Date.now() - start
  // console.log(`elapsed time`, time / 1000, `seconds`)
  // }
  // response.end()
  // })
  // })
  // .listen(port)
  // }

  // let socket
  // exports.init = theSocket => {
  // socket = theSocket
  // }

  const knownTaskFunctions = new Set()

  const downloadedFiles = new Map()
  const inFlightDownloads = new Map()
  const getFile = ([name, file]) => {
    // console.log({ alreadyDownloaded: downloadedFiles.size, name, file })
    if (downloadedFiles.has(file.digest)) {
      return downloadedFiles.get(file.digest)
    } else if (inFlightDownloads.has(file.digest)) {
      return inFlightDownloads.get(file.digest)
    } else {
      const downloadPromise = new Promise(resolve => {
        process.send({ cmd: `emit`, emit: `sendFile`, args: { ...file, name } })
        parentMessages.once(file.digest, async fileObject => {
          // set on downloadedFiles
          downloadedFiles.set(file.digest, fileObject)

          resolve(fileObject)
        })
      })

      inFlightDownloads.set(file.digest, downloadPromise)
      return downloadPromise
    }
  }
  const getFiles = async files => {
    const pairs = await Promise.all(_.toPairs(files).map(pair => getFile(pair)))
    // Recreate object
    const filesObj = {}
    pairs.forEach(pair => (filesObj[pair.name] = pair))
    return filesObj
  }

  const funcDirs = new Set()
  const runTask = async task => {
    // console.log(task)
    // Hash the func + dependencies (you can pass in dynamic dependencies).
    const funcDir = path.join(functionDir, task.digest)
    const funcPath = path.join(functionDir, task.digest, `index.js`)
    if (!funcDirs.has(funcDir)) {
      fs.ensureDirSync(funcDir)
      funcDirs.add(funcDir)
    }

    // Check if SETUP file exists
    if (!knownTaskFunctions.has(funcPath)) {
      if (fs.existsSync(path.join(funcDir, `SETUP`))) {
        knownTaskFunctions.add(funcPath)
      }
    }

    // Check if the function folder is setup (with special file).
    // If not, try to get a lock to set it up
    // if that fails, listen for the event that it's ready.
    // console.log(`SETUP exists`, fs.existsSync(path.join(funcDir, `SETUP`)))
    if (!knownTaskFunctions.has(funcPath)) {
      // Am I the worker choosen to setup this task directory?
      if (task.func) {
        console.log(`setup function`, funcPath, task.dependencies)
        console.time(`setting up function ${funcPath}`)
        fs.writeFileSync(funcPath, `module.exports = ${task.func}`)
        if (task.dependencies) {
          const output = await execa(`npm`, [`init`, `--yes`], {
            cwd: funcDir,
          })
          console.log({ output })
          console.log([
            `install`,
            ..._.toPairs(task.dependencies).map(
              ([name, version]) => `${name}@${version}`
            ),
            `--legacy-peer-deps`,
          ])
          const output2 = await execa(
            `npm`,
            [
              `install`,
              ..._.toPairs(task.dependencies).map(
                ([name, version]) => `${name}@${version}`
              ),
              `--legacy-peer-deps`,
            ],
            { cwd: funcDir }
          )
          console.log({ output2 })
        }

        fs.writeFileSync(path.join(funcDir, `SETUP`), `true`)
        knownTaskFunctions.add(funcPath)
        process.send({ cmd: `broadcast`, msg: `taskSetup-${task.digest}` })
        console.timeEnd(`setting up function ${funcPath}`)
      } else {
        // Ok, nope, just wait for it to be setup.
        await pEvent(parentMessages, `taskSetup-${task.digest}`)
        knownTaskFunctions.add(funcPath)
      }
    }

    // Ensure files are downloaded and get local path.
    let files
    if (task.files) {
      files = await getFiles(task.files)
    }

    return actuallyRunTask({
      funcPath,
      args: task.args,
      files,
      id: task.id,
      cache: { set: setAsync, get: getAsync },
    })
  }

  const actuallyRunTask = async ({ funcPath, args, files, id, cache }) => {
    // console.time(`runTask ${id}`)
    let taskRunner = require(funcPath)
    if (taskRunner.default) {
      taskRunner = taskRunner.default
    }

    // Copy the trace Id to make sure task functions can't change it.
    const copyOfTraceId = (` ` + id).slice(1)
    const start = performance.now()
    const result = await Promise.resolve(
      taskRunner(args, { id: copyOfTraceId, files, cache })
    )
    const end = performance.now()
    // console.timeEnd(`runTask ${id}`)
    // socket.emit(`response-${id}`, {
    // result,
    // id,
    // executionTime: end - start,
    // })
    return {
      result,
      id,
      executionTime: end - start,
    }
  }
}
