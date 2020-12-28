// Gatsby's scheduler

// const IP = `159.65.103.164`
const IP = `143.110.158.220`

const fs = require(`fs-extra`)
const crypto = require(`crypto`)
const path = require(`path`)
const _ = require(`lodash`)
var socket = require("socket.io-client")(`http://${IP}:3000`)
const { default: PQueue } = require("p-queue")
const uuid = require(`uuid`)
const fetch = require(`node-fetch`)
const http = require(`http`)
const JestWorker = require(`jest-worker`).default

// const chunkSize = 100
// const worker = new JestWorker(require.resolve("./upload-worker"), {
// numWorkers: 4,
// })

// Create queue and pause immediately and resume once the server is ready
const queue = new PQueue({ concurrency: 600 })
// queue.pause()

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
  let outsideResolve
  taskPromise = new Promise(resolve => {
    outsideResolve = resolve
  })
  // preprocess and then add to the queue
  // TODO only send hash of the handler function.
  const taskFn = () => {
    return new Promise(async resolve => {
      task.traceId = uuid.v4()

      if (_.isFunction(task.handler)) {
        task.handler = task.handler.toString()
      }

      if (task.files && !_.isEmpty(task.files)) {
        await Promise.all(
          _.toPairs(task.files).map(async ([name, file]) => {
            const hash = await md5File(file.originPath)
            // Discard the file path
            task.files[name] = { ...file, hash }
          })
        )
      }
      // console.time(`runTask ${task.traceId}`)
      socket.emit(`runTask`, task)
      socket.once(`response-${task.traceId}`, res => {
        // console.log(res.result.)
        // console.timeEnd(`runTask ${task.traceId}`)
        outsideResolve(res)
        resolve()
      })
    })
  }

  queue.add(taskFn)

  return taskPromise
}

let count = 0
let startTime
queue.on("active", () => {
  count += 1
  if (count % 100 === 0 || queue.pending === 0) {
    console.log(
      `Working on item #${count}.  Size: ${queue.size}  Pending: ${queue.pending}`
    )

    const now = Date.now()
    const diffTime = now - startTime
    console.log(
      `elapsed time: ${diffTime / 1000}s — ${
        count / (diffTime / 1000)
      } tasks / second`
    )
  }
})

exports.runTask = runTask

const filePath = path.resolve(`./data.json`)
const filePath2 = path.resolve(`./data2.json`)
// _.range(1).forEach(i => {
// runTask({
// handler: async (args, { files }) => {
// const path = require(`path`)
// const fs = require(`fs-extra`)

// const jsonData = JSON.parse(
// await fs.readFile(files.data.localPath, `utf-8`)
// )
// jsonData.super = jsonData.super += 10
// const newPath = path.join(`blue`, `moon`)
// return {
// "Math!": args.a + args.b * Math.random(),
// path: newPath,
// jsonData,
// }
// },
// args: { a: 10, b: i + 2 },
// files: {
// data: {
// originPath: Math.random() > 0.5 ? filePath : filePath2,
// },
// },
// })
// })

const anotherHandler = args => {
  return `hello ${args.name}!`
}

runTask({
  handler: anotherHandler,
  args: { name: `Jack` },
}).then(result => {
  console.log(`the result`, result)
})

// Pretend SSR
const rootSite = `/Users/kylemathews/programs/gatsby/benchmarks/markdown_id`
const glob = require(`glob`)
const files = glob.sync(`${rootSite}/public/page-data/**/page-data.json`)
console.log(files)
const httpAgent = new http.Agent({
  keepAlive: true,
})
console.log({ httpAgent })
files.forEach(pageDataFilePath => {
  const url = `http://${IP}:3001`
  const postTask = async () => {
    // await worker.upload(url, pageDataFilePathChunk)
    const stream = fs.createReadStream(pageDataFilePath)
    return fetch(url, { method: "POST", body: stream, agent: () => httpAgent })
  }

  queue.add(postTask)
  // return runTask({
  // handler: async (args, { files }) => {
  // const fs = require(`fs-extra`)
  // const _ = require(`lodash`)

  // const paths = _.toPairs(files).map(([name, file]) => {
  // return { name, localPath: file.localPath }
  // })

  // return Promise.all(
  // paths.map(async path => {
  // const stat = await fs.stat(path.localPath)
  // return { ...path, size: stat.size }
  // })
  // )
  // },
  // files: {
  // "webpack.stats.json": {
  // originPath: path.join(rootSite, `public`, `webpack.stats.json`),
  // },
  // "chunk-map.json": {
  // originPath: path.join(rootSite, `public`, `chunk-map.json`),
  // },
  // app: {
  // originPath: path.join(
  // rootSite,
  // `public`,
  // `app-189612a2bb33ba0959bf.js`
  // ),
  // },
  // "styles.css": {
  // originPath: path.join(
  // rootSite,
  // `public`,
  // `styles.5f81339daa9828444137.css`
  // ),
  // },
  // pageData: {
  // originPath: pageDataFilePath,
  // },
  // },
  // })
})

socket.on(`connect`, async function () {
  socket.emit(`setTaskRunner`, fs.readFileSync(`./remote-task-runner.js`))
  socket.on(`serverReady`, () => {
    queue.start()
    startTime = Date.now()
    console.log(`serverReady`)

    socket.on(`response`, res => {
      // console.log(res)
    })
  })

  socket.on(`sendFile`, async file => {
    // console.log(`sendFile`, file)
    const fileContents = await fs.readFile(file.originPath)
    socket.emit(file.hash, fileContents)
  })
})

socket.on("disconnect", function () {})
