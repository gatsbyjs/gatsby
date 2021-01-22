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

// const numPages = 10000
const pages100 = []
const pages10000 = []
_.range(100).map(page => {
  pages100.push({
    pagePath: page.toString(),
    publicDir: cheese.publicDir,
    chiz: 1,
    chiz2: 1.1,
  })
})

_.range(10000).map(page => {
  pages10000.push({
    pagePath: page.toString(),
    publicDir: cheese.publicDir,
    chiz: 1,
    chiz2: 1.1,
  })
})

let start = 0
let end = 0
let total = 0

JSON.stringify(pages100)
JSON.stringify(pages100)
JSON.stringify(pages100)
JSON.stringify(pages100)
JSON.stringify(pages100)
JSON.stringify(pages100)
JSON.stringify(pages100)
JSON.stringify(pages100)
JSON.stringify(pages100)
JSON.stringify(pages100)
start = performance.now()
JSON.stringify(pages100)
end = performance.now()

total = end - start
console.log(`json`, total, 1000 / (total / 100))

const str = JSON.stringify(pages100)
console.log(`json length`, str.length)
start = performance.now()
JSON.parse(str)
end = performance.now()

console.log(`json deserialize`, end - start)
_.range(100).forEach(() => {
  taskType.toBuffer(pages100)
})

start = performance.now()
taskType.toBuffer(pages100)
end = performance.now()

total = end - start
console.log(`avro 100`, total, 1000 / (total / 100))

start = performance.now()
taskType.toBuffer(pages10000)
end = performance.now()

total = end - start
console.log(`avro 10000`, total, 1000 / (total / 10000))

const buf = taskType.toBuffer(pages100)
console.log(`avro length`, buf.length)

_.range(100).forEach(() => {
  taskType.fromBuffer(buf)
})
start = performance.now()
const result = taskType.fromBuffer(buf)
end = performance.now()

total = end - start
console.log(`avro deserialize`, total, 1000 / (total / 100))
console.log({ result: result[0] })
