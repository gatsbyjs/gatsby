// Gatsby's scheduler

const fs = require(`fs-extra`)
const crypto = require(`crypto`)
const path = require(`path`)
var socket = require("socket.io-client")("http://143.110.158.220:3000")

function md5File(path) {
  return new Promise((resolve, reject) => {
    const output = crypto.createHash("md5")
    const input = fs.createReadStream(path)

    input.on("error", err => {
      reject(err)
    })

    output.once("readable", () => {
      resolve(output.read().toString("hex"))
    })

    input.pipe(output)
  })
}

const handler = async (args, { files }) => {
  const path = require(`path`)
  const fs = require(`fs-extra`)

  const jsonData = JSON.parse(await fs.readFile(files[0], `utf-8`))
  jsonData.super = jsonData.super += 10
  const newPath = path.join(`blue`, `moon`)
  return { "Math!": args.a + args.b * Math.random(), path: newPath, jsonData }
}

const args = { a: 2111, b: 2 }

const filePath = path.resolve(`./data.json`)

socket.on("connect", async function () {
  const hash = await md5File(filePath)
  socket.emit(`setTaskRunner`, fs.readFileSync(`./remote-task-runner.js`))
  socket.on(`serverReady`, () => {
    console.log(`serverReady`)
    var i
    for (i = 0; i < 10; i++) {
      console.time(`runTask ${i}`)
      socket.emit(`runTask`, {
        handler: handler.toString(),
        args: { ...args, b: i },
        files: [hash],
        traceId: i,
      })
    }

    socket.on(`response`, res => {
      // console.log(res)
      console.timeEnd(`runTask ${res.traceId}`)
    })
  })

  socket.on(`sendFile`, file => {
    console.log(`sendFile`, file)
    socket.emit(file, fs.readFileSync(filePath))
  })
})
socket.on("disconnect", function () {})
