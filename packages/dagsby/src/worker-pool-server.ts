const fs = require("fs-extra")
const path = require("path")
const cluster = require("cluster")
const { EventEmitter } = require("events")
const pEvent = require("p-event")
const http = require("http")
const os = require(`os`)
const { performance } = require("perf_hooks")
const _ = require(`lodash`)
const execa = require(`execa`)

const yargs = require("yargs/yargs")
const { hideBin } = require("yargs/helpers")
const argv = yargs(hideBin(process.argv))
  .default(`directory`, () => os.tmpdir())
  .default(`numWorkers`, () => os.cpus().length - 1)
  .default(`socketPort`, () => 6899)
  .default(`httpPort`, () => 6898).argv

console.log(`worker-pool-server`, argv)

const options = {
  directory: argv.directory,
  numWorkers: argv.numWorkers,
  socketPort: argv.socketPort,
  httpPort: argv.httpPort,
}

const functionDir = path.join(options.directory, `.cache`, `worker-tasks`)
const filesDir = path.join(options.directory, `.cache`, `files`)

if (cluster.isMaster) {
  console.log(`worker-server`, options)

  const controls = {}

  // Setup directories
  console.log({ filesDir, functionDir })
  fs.ensureDirSync(functionDir)
  fs.ensureDirSync(filesDir)

  const io = require("socket.io")(options.socketPort)
  controls.destroy = () => {
    console.log(`DESTROY`)
    io.close()
  }

  let socket
  console.log(`master pid ${process.pid}`)

  io.on("connection", sock => {
    console.log(`connected to socket`)
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
        console.log(`socket.io emit`, msg.args)
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
  for (let i = 0; i < options.numWorkers; i++) {
    cluster.fork()
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on("message", messageHandler)
  }
} else {
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
        console.log(`tasks`, tasks)
        // process.exit()
        const results = await Promise.all(tasks.map(task => runTask(task)))
        console.log(`received results`)
        res.writeHead(200)
        res.end(JSON.stringify(results))
      })
      // Notify master about the request
      // process.send({ cmd: "notifyRequest" })
    })
    .listen(options.httpPort)

  console.log(`Worker ${process.pid} started`)

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
        process.send({
          cmd: `emit`,
          emit: `sendFile`,
          args: { ...file, name },
        })
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
      cache: { set: (key, value) => {}, get: key => {} },
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
