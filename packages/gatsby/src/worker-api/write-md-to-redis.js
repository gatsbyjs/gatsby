const template = require(`../../../../benchmarks/markdown_id/md.tpl.js`)
const redis = require("redis")
const { promisify } = require("util")
const { default: PQueue } = require("p-queue")

const client = redis.createClient({ host: `0.0.0.0` })
const getAsync = promisify(client.get).bind(client)
const setAsync = promisify(client.set).bind(client)

const NUM_PAGES = parseInt(process.env.NUM_PAGES || 1000)

const queue = new PQueue({ concurrency: 1000 })

let count = 0
let startTime = 0
let lastTime = 0
let lastCount = 0
queue.on("active", () => {
  count += 1
  if (count % 5000 === 0 || queue.pending === 0) {
    console.log(
      `Working on item #${count}.  Size: ${queue.size}  Pending: ${queue.pending}`
    )

    const now = Date.now()
    const diffTime = now - startTime
    let rate = ``
    if (lastTime) {
      rate = (count - lastCount) / ((now - lastTime) / 1000)
    }
    console.log(`elapsed time: ${diffTime / 1000}s — ${rate} tasks / second`)
    lastTime = now
    lastCount = count
  }
})

// console.time(`Generated in`)
// Create markdown nodes
for (let step = 0; step < NUM_PAGES; step++) {
  queue.add(async () => {
    let page = template(step)
    await setAsync(`${step}.md`, page)
  })
}
// console.log(`--> 100%`)
// console.timeEnd(`Generated in`)
