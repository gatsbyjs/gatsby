const { murmurhash } = require(`babel-plugin-remove-graphql-queries`)
const path = require(`path`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)

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
  console.log({ downloadedFiles, name, file })
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
        console.log({ localPath })
        await fs.writeFile(localPath, fileBlob)

        const fileObject = { ...file, name, localPath }
        // set on downloadedFiles
        downloadedFiles.set(file.hash, fileObject)
        console.log({ downloadedFiles })

        resolve(fileObject)
      })
    })

    inFlightDownloads.set(file.hash, downloadPromise)
    return downloadPromise
  }
}
const getFiles = async files => {
  const pairs = await Promise.all(_.toPairs(files).map(pair => getFile(pair)))
  console.log({ pairs })
  // Recreate object
  const filesObj = {}
  pairs.forEach(pair => (filesObj[pair.name] = pair))
  return filesObj
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
  console.log(`the files`, files)

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
  socket.emit(`response-${traceId}`, { result, traceId })
}

exports.warmup = () => {}
