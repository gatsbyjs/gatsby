const { Storage } = require("@google-cloud/storage")
const fs = require(`fs-extra`)
const { default: PQueue } = require("p-queue")
const { RateLimit } = require("async-sema")
const execa = require(`execa`)
const _ = require(`lodash`)
const { EventEmitter } = require("events")
const pEvent = require("p-event")

const emitter = new EventEmitter()

const queue = new PQueue({ concurrency: 250 })
// const lim = RateLimit(100, { uniformDistribution: true })
let count = 0

const numWorkers = 10
const workers = []
_.range(numWorkers).forEach(i => {
  const worker = execa.node(`upload-file.js`)
  worker.stdout.pipe(process.stdout)
  worker.stderr.pipe(process.stderr)
  worker.on(`message`, file => {
    emitter.emit(file)
  })
  workers.push(worker)
})

queue.on("next", () => {
  count += 1
  if (count % 25 === 0 || queue.pending === 0) {
    console.log(
      `${process.pid} Working on item #${count}.  Size: ${queue.size}  Pending: ${queue.pending}`
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

// Creates a client
// const storage = new Storage({ keyFilename: `./key.json` })

const rootSite = `/Users/kylemathews/programs/gatsby/benchmarks/markdown_id`
const glob = require(`glob`)
const files = glob.sync(`${rootSite}/public/page-data/**/page-data.json`)
const startTime = Date.now()
console.log(files.length)
files.forEach((file, i) =>
  queue.add(async () => {
    // await lim()
    // console.time(`write to bucket ${file}`)
    workers[i % numWorkers].send(file)
    await pEvent(emitter, file)
    // const writeToBucket = await storage
    // .bucket(`run-task-experiment-website`)
    // .file(`${Math.random()}${file}`)
    // .save(fs.readFileSync(file, `utf-8`))
    // console.timeEnd(`write to bucket ${file}`)
  })
)
