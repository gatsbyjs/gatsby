// Gatsby's scheduler

const fs = require(`fs-extra`)
const crypto = require(`crypto`)
const path = require(`path`)
const _ = require(`lodash`)
var socket = require("socket.io-client")("http://143.110.158.220:3000")
const { default: PQueue } = require("p-queue")
const uuid = require(`uuid`)

// Create queue and pause immediately and resume once the server is ready
const queue = new PQueue({ concurrency: 100 })
queue.pause()

const mtimes = new Map()
const hashes = new Map()
const inFlight = new Map()
async function md5File(filePath) {
  if (inFlight.has(filePath)) {
    return inFlight.get(filePath)
  } else {
    const md5Promise = new Promise((resolve, reject) => {
      const newMtime = fs.statSync(filePath).mtime.getTime()
      let renew = false
      // Has the file changed?
      if (mtimes.has(filePath)) {
        if (newMtime !== mtimes.get(filePath)) {
          renew = true
        }
      } else {
        renew = true
      }

      mtimes.set(filePath, newMtime)

      // If we need to renew, calculate, cache and return.
      if (renew) {
        const output = crypto.createHash("md5")
        const input = fs.createReadStream(filePath)

        input.on("error", err => {
          reject(err)
        })

        output.once("readable", () => {
          const newHash = output.read().toString("hex")
          hashes.set(filePath, newHash)
          resolve(newHash)
        })

        input.pipe(output)
      } else {
        resolve(hashes.get(path))
      }
    })

    inFlight.set(filePath, md5Promise)
    return md5Promise
  }
}

const runTask = async task => {
  return new Promise(async runTaskResolve => {
    // preprocess and then add to the queue
    task.traceId = uuid.v4()

    if (_.isFunction(task.handler)) {
      task.handler = task.handler.toString()
    }

    console.log(task.files, _.isEmpty(task.files), _.toPairs(task.files))
    if (task.files && !_.isEmpty(task.files)) {
      await Promise.all(
        _.toPairs(task.files).map(async ([name, file]) => {
          console.log(`inside`, { name, file })
          const hash = await md5File(file.originPath)
          // Discard the file path
          task.files[name] = { ...file, hash }
        })
      )
    }
    console.log(task)
    // TODO only send hash of the handler function.
    const taskFn = () => {
      return new Promise(resolve => {
        console.time(`runTask ${task.traceId}`)
        socket.emit(`runTask`, task)
        socket.once(`response-${task.traceId}`, res => {
          console.log(res)
          console.timeEnd(`runTask ${task.traceId}`)
          runTaskResolve(res)
          resolve()
        })
      })
    }

    queue.add(taskFn)
  })
}

exports.runTask = runTask

const handler = async (args, { files }) => {
  const path = require(`path`)
  const fs = require(`fs-extra`)

  console.log({ files })
  const jsonData = JSON.parse(await fs.readFile(files.data.localPath, `utf-8`))
  jsonData.super = jsonData.super += 10
  const newPath = path.join(`blue`, `moon`)
  return { "Math!": args.a + args.b * Math.random(), path: newPath, jsonData }
}

const args = { a: 2111, b: 2 }

const filePath = path.resolve(`./data.json`)
const filePath2 = path.resolve(`./data2.json`)
_.range(1).forEach(i => {
  runTask({
    handler: handler,
    args: { ...args, b: i },
    files: {
      data: {
        originPath: Math.random() > 0.5 ? filePath : filePath2,
      },
    },
  })
})

const anotherHandler = args => {
  return `hello ${args.name}!`
}

runTask({
  handler: anotherHandler,
  args: { name: `Jack` },
}).then(result => {
  console.log(`the result`, result)
})

socket.on(`connect`, async function () {
  socket.emit(`setTaskRunner`, fs.readFileSync(`./remote-task-runner.js`))
  socket.on(`serverReady`, () => {
    queue.start()
    console.log(`serverReady`)

    socket.on(`response`, res => {
      // console.log(res)
    })
  })

  socket.on(`sendFile`, async file => {
    console.log(`sendFile`, file)
    const fileContents = await fs.readFile(file.originPath)
    socket.emit(file.hash, fileContents)
  })
})

socket.on("disconnect", function () {})
