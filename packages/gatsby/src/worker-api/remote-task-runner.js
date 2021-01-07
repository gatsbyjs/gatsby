const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const path = require(`path`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)
var http = require("http")
var compress = require("compression")
const cluster = require(`cluster`)
const { performance } = require("perf_hooks")
const execa = require(`execa`)

var counter = 0
var port = 3001

let count = 0
let start
// if (cluster.isMaster) {
// // Keep track of http requests
// let numReqs = 0
// setInterval(() => {
// console.log(`numReqs = ${numReqs}`)
// }, 1000)

// // Count requests
// function messageHandler(msg) {
// if (msg.cmd && msg.cmd === "notifyRequest") {
// numReqs += 1
// }
// }

// // Start workers and listen for messages containing notifyRequest
// const numCPUs = require("os").cpus().length
// for (let i = 0; i < numCPUs; i++) {
// cluster.fork()
// }

// for (const id in cluster.workers) {
// cluster.workers[id].on("message", messageHandler)
// }
// } else {
const files = new Map()
function postRequest(request, response, callback) {
  // compress({})(request, response, () => {})
  if (request.method == "POST") {
    if (!start) {
      start = Date.now()
    }
    // var writeStream = fs.createWriteStream("/tmp/" + ++counter + port)

    let newFile = ``
    request.on("data", function (data) {
      newFile += data.toString()
    })

    request.on("end", function () {
      files.set(++counter, newFile)
      if (files.size % 100 == 0) {
        console.log(files.size)
      }
      callback()
    })
  }
}

http
  .createServer(function (request, response) {
    postRequest(request, response, function () {
      response.writeHead(200, "OK", { "Content-Type": "text/plain" })
      count += 1
      if (count % 100 === 0) {
        console.log(`uploaded ${count} files`)
      }
      if (count === 10000) {
        const time = Date.now() - start
        console.log(`elapsed time`, time / 1000, `seconds`)
      }
      response.end()
    })
  })
  .listen(port)
// }

const functionDir = path.join(__dirname, `worker-tasks`)
const filesDir = path.join(__dirname, `files`)
fs.ensureDirSync(functionDir)
fs.ensureDirSync(filesDir)

let socket
exports.init = theSocket => {
  socket = theSocket
}

const knownTaskFunctions = new Set()

const downloadedFiles = new Map()
const inFlightDownloads = new Map()
const getFile = ([name, file]) => {
  // console.log({ alreadyDownloaded: downloadedFiles.size, name, file })
  if (downloadedFiles.has(file.hash)) {
    return downloadedFiles.get(file.hash)
  } else if (inFlightDownloads.has(file.hash)) {
    return inFlightDownloads.get(file.hash)
  } else {
    const downloadPromise = new Promise(resolve => {
      socket.emit(`sendFile`, file)
      socket.once(file.hash, async fileBlob => {
        // Make path
        const localPath = path.join(filesDir, file.hash)
        await fs.writeFile(localPath, fileBlob)

        const fileObject = { ...file, name, localPath, fileBlob }

        // set on downloadedFiles
        downloadedFiles.set(file.hash, fileObject)

        resolve(fileObject)
      })
    })

    inFlightDownloads.set(file.hash, downloadPromise)
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

// const waiting

const handlerDirs = new Set()
exports.runTask = async task => {
  // Hash the handler + dependencies (you can pass in dynamic dependencies).
  const handlerHash = String(
    murmurhash(
      JSON.stringify({ handler: task.handler, dependencies: task.dependencies })
    )
  )
  const handlerDir = path.join(functionDir, handlerHash)
  const handlerPath = path.join(functionDir, handlerHash, `index.js`)
  if (!handlerDirs.has(handlerDir)) {
    fs.ensureDirSync(handlerDir)
    handlerDirs.add(handlerDir)
  }
  // Write out the function if necessary.
  if (!knownTaskFunctions.has(handlerPath)) {
    fs.writeFileSync(handlerPath, `module.exports = ${task.handler}`)
    if (task.dependencies) {
      const output = await execa(`npm`, [`init`, `--yes`], { cwd: handlerDir })
      const output2 = await execa(
        `npm`,
        [
          `install`,
          ..._.toPairs(task.dependencies).map(
            ([name, version]) => `${name}@${version}`
          ),
        ],
        { cwd: handlerDir }
      )
    }
    knownTaskFunctions.add(handlerPath)
  }

  // Ensure files are downloaded and get local path.
  let files
  if (task.files) {
    files = await getFiles(task.files)
  }

  actuallyRunTask({
    handlerPath,
    args: task.args,
    files,
    traceId: task.traceId,
  })
}

const actuallyRunTask = async ({ handlerPath, args, files, traceId }) => {
  // console.time(`runTask ${traceId}`)
  let taskRunner = require(handlerPath)
  if (taskRunner.default) {
    taskRunner = taskRunner.default
  }

  // Copy the trace Id to make sure task functions can't change it.
  const copyOfTraceId = (` ` + traceId).slice(1)
  const start = performance.now()
  const result = await Promise.resolve(
    taskRunner(args, { traceId: copyOfTraceId, files })
  )
  const end = performance.now()
  // console.timeEnd(`runTask ${traceId}`)
  socket.emit(`response-${traceId}`, {
    result,
    traceId,
    executionTime: end - start,
  })
}

exports.warmup = () => {}
