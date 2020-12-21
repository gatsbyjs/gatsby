const Remark = require(`remark`)
const faker = require(`faker`)
const matter = require(`gray-matter`)
const _ = require(`lodash`)
const JestWorker = require("jest-worker").default
const v8 = require(`v8`)

const { user, system } = process.cpuUsage()
let lastUserTime = user
let lastSystemTime = system
let totalSystemTime = 0
let totalUserTime = 0
let lastTime = Date.now()

setInterval(() => {
  const { user, system } = process.cpuUsage()
  const newUserTime = user - lastUserTime
  const newSystemTime = system - lastSystemTime
  const newTime = Date.now()
  totalSystemTime += newSystemTime
  totalUserTime += newUserTime
  diffTime = newTime - lastTime

  // Reset
  lastUserTime = user
  lastSystemTime = system
  lastTime = newTime

  console.log({
    diffTime,
    newUserTime: newUserTime / 1000,
    newSystemTime: newSystemTime / 1000,
    totalUserTime,
    totalSystemTime,
  })
}, 100)

require(`./time-sum`)

const remark = new Remark()

const MAX_NUM_ROWS = 550

const createMarkdownStr = index => `${matter
  .stringify(``, {
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    path: `/${faker.helpers.slugify(faker.lorem.sentence())}`,
    date: faker.date.recent(1000).toISOString().slice(0, 10),
    tags: `[${faker.random
      .words(3)
      .split(` `)
      .map(w => `"${w}"`)
      .join(`, `)}]`,
  })
  .trim()}

## Page #${index} : ${faker.random.words(4)}

### API


${new Array(faker.random.number(MAX_NUM_ROWS))
  .fill(undefined)
  .map(() =>
    `
|${faker.lorem.word()}|${faker.lorem.sentence()}|${faker.random.boolean()}|
`.trim()
  )
  .join(`\n`)}

### More Detail

${faker.lorem.paragraphs()}
`

const mdStrs = _.range(10000).map(i => createMarkdownStr(i))

// console.log(mdStrs[0])
// console.log(mdStrs[3])

// vanila
// console.timeSumGroup(`md-parse`)
// _.chunk(mdStrs, 20).forEach(mdStrChunk => {
// // remark.parse(mdStr)
// // grayMatter(mdStr)
// require(`./Worker.js`).parseMdx(mdStrChunk)
// })
// console.timeSumGroupEnd(`md-parse`)
// console.timeSumPrint()

// jest worker
async function main() {
  const workers = new JestWorker(require.resolve(`./Worker`), {
    // enableWorkerThreads: true,
    // numWorkers: 8,
  })
  // console.log(workers._workerPool._workers)

  // Warm up the workers
  await Promise.all(
    workers._workerPool._workers.map(async () => {
      await workers.warmup()
    })
  )

  console.timeSumGroup(`md-parse normal jest worker`)
  Promise.all(
    _.chunk(mdStrs, 10).map(async mdStrChunk => {
      // console.timeSum(`md-parse ${i}`)
      // const serializer = new v8.Serializer()
      // serializer.writeValue(mdStrChunk)
      // console.log(serializer.releaseBuffer())
      // console.log(serialized.length)
      // const sharedBuffer = new SharedArrayBuffer(
      // Int32Array.BYTES_PER_ELEMENT * serializer.length
      // )
      // const arr = new Int32Array(sharedBuffer)
      // serializer.transferArrayBuffer(1, arr)
      // console.log(arr.length)
      // arr.set(serialized)

      const result = await workers.parseMdx(mdStrChunk)
      // await workers.parseMdx(mdStr)
      // await workers.grayMatter(mdStr)
      // console.timeSumEnd(`md-parse ${i}`)
    })
  ).then(() => {
    console.log(`done`)
    console.timeSumGroupEnd(`md-parse normal jest worker`)
    console.timeSumPrint()
    process.exit()
  })
}

main()

// microjob
// ;(async () => {
// const { start, job } = require("microjob")

// try {
// // start worker pool
// await start()
// // await Promise.all(
// // mdStrs.slice(0, 20).map(async (mdStr, i) => {
// // // console.timeSum(`md-parse ${i}`)
// // await job(
// // str => {
// // const Remark = require(`remark`)
// // const remark = new Remark()
// // return remark.parse(str)
// // },
// // { str: mdStr }
// // )
// // // console.timeSumEnd(`md-parse ${i}`)
// // })
// // )
// // await Promise.all(
// // mdStrs.map(async (mdStr, i) => {
// // // console.timeSum(`md-parse ${i}`)
// // await job(
// // ({ str }) => {
// // const Remark = require(`remark`)
// // const remark = new Remark()
// // return remark.parse(str)
// // },
// // { data: { str: mdStr } }
// // )
// // // console.timeSumEnd(`md-parse ${i}`)
// // })
// // )

// console.timeSumGroup(`md-parse microjob`)
// await Promise.all(
// mdStrs.map(async (mdStr, i) => {
// // console.timeSum(`md-parse ${i}`)
// await job(
// ({ str }) => {
// const Remark = require(`remark`)
// const remark = new Remark()
// return remark.parse(str)
// },
// { data: { str: mdStr } }
// )
// // console.timeSumEnd(`md-parse ${i}`)
// })
// )
// } catch (err) {
// console.error(err)
// }

// console.timeSumGroupEnd(`md-parse microjob`)
// console.timeSumPrint()
// })()

// manual worker
// const numCPUs = require(`os`).cpus().length
// console.log({ numCPUs })
// const { Worker } = require("worker_threads")
// const workerPool = []
// let messagesReceived = 0
// var done = (function wait() {
// if (!done) setTimeout(wait, 1000)
// })()
// // Make workers
// Promise.all(
// _.range(numCPUs).map(
// i =>
// new Promise(resolve => {
// const workerInstance = new Worker(
// require(`path`).resolve(`./thread-worker.js`)
// )
// workerInstance.once(`online`, () => {
// workerPool.push(workerInstance)
// resolve()
// })
// workerInstance.on(`message`, result => {
// messagesReceived += 1
// console.log({ messagesReceived })
// console.log(workerInstance.status)
// if (messagesReceived === numCPUs) {
// console.log({ messagesReceived })
// console.timeSumGroupEnd(`md-parse raw workers`)
// console.timeSumPrint()
// process.exit()
// }
// })
// })
// )
// ).then(async () => {
// console.log(`ready`)
// console.log(mdStrs.length)
// const splitToChunks = (array, parts) => {
// let result = []
// for (let i = parts; i > 0; i--) {
// result.push(array.splice(0, Math.ceil(array.length / i)))
// }
// return result
// }

// splitToChunks(mdStrs, numCPUs).forEach((chunk, i) => {
// workerPool[i].postMessage(chunk)
// })
// workerPool[0].once(`error`, () => {})
// })
