const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const path = require(`path`)
const fs = require(`fs-extra`)

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
const getFile = file => {
  console.log({ downloadedFiles })
  if (downloadedFiles.has(file)) {
    return downloadedFiles.get(file)
  } else if (inFlightDownloads.has(file)) {
    return inFlightDownloads.get(file)
  } else {
    const downloadPromise = new Promise(resolve => {
      socket.emit(`sendFile`, file)
      socket.on(file, async fileBlob => {
        // Make path
        const downloadedFilePath = path.join(filesDir, file)
        console.log({ downloadedFilePath })
        await fs.writeFile(downloadedFilePath, fileBlob)

        // set on downloadedFiles
        downloadedFiles.set(file, downloadedFilePath)
        console.log({ downloadedFiles })

        resolve(downloadedFilePath)
      })
    })

    inFlightDownloads.set(file, downloadPromise)
    return downloadPromise
  }
}
const getFiles = async files => {
  return Promise.all(files.map(file => getFile(file)))
}

// const waiting

exports.runTask = async task => {
  console.log(task)
  const handlerHash = murmurhash(task.handler) + `.js`
  const handlerPath = path.join(functionDir, handlerHash)
  // Write out the function if necessary.
  if (!knownTaskFunctions.has(handlerPath)) {
    fs.writeFileSync(handlerPath, `module.exports = ${task.handler}`)
    knownTaskFunctions.add(handlerPath)
  }

  // Ensure files are downloaded and get local path.
  let files
  if (task.files) {
    files = await getFiles(task.files)
  }
  console.log(files)

  actuallyRunTask({
    handlerPath,
    args: task.args,
    files,
    traceId: task.traceId,
  })
}

const actuallyRunTask = async ({ handlerPath, args, files, traceId }) => {
  let taskRunner = require(handlerPath)
  if (taskRunner.default) {
    taskRunner = taskRunner.default
  }

  // Copy the trace Id to make sure task functions can't change it.
  const copyOfTraceId = (` ` + traceId).slice(1)
  const result = await Promise.resolve(
    taskRunner(args, { traceId: copyOfTraceId, files })
  )
  socket.emit(`response`, { result, traceId })
}

exports.warmup = () => {}
