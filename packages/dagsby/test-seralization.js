const avro = require("avsc")
const _ = require(`lodash`)
const { performance } = require("perf_hooks")

const cheese = {
  pagePath: `hi`,
  chiz: 1.10000342040234020340234,
  chiz2: 1.1023402340204023042034,
  publicDir: `what is the meaning of this???`,
}
const taskType = avro.Type.forValue([cheese])

console.log(JSON.stringify(taskType, null, 4))

const numPages = 10000
const pages = []
_.range(numPages).map(page => {
  pages.push({
    pagePath: page.toString(),
    publicDir: cheese.publicDir,
    chiz: 1,
    chiz2: 1.1,
  })
})

let start = 0
let end = 0

JSON.stringify(pages)
JSON.stringify(pages)
JSON.stringify(pages)
JSON.stringify(pages)
JSON.stringify(pages)
JSON.stringify(pages)
JSON.stringify(pages)
JSON.stringify(pages)
JSON.stringify(pages)
JSON.stringify(pages)
start = performance.now()
JSON.stringify(pages)
end = performance.now()

console.log(`json`, end - start)
const str = JSON.stringify(pages)
start = performance.now()
JSON.parse(str)
end = performance.now()

console.log(`json deserialize`, end - start)
// _.range(100).forEach(() => {
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// taskType.toBuffer(pages)
// })

// start = performance.now()
// taskType.toBuffer(pages)
// end = performance.now()

// console.log(`avro`, end - start)

const buf = taskType.toBuffer(pages)

_.range(100).forEach(() => {
  taskType.fromBuffer(buf)
})
start = performance.now()
const result = taskType.fromBuffer(buf)
end = performance.now()

console.log(`avro deserialize`, end - start)
console.log({ result: result[0] })
