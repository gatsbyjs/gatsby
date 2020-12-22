// Gatsby's scheduler

const fs = require(`fs-extra`)
var socket = require("socket.io-client")("http://143.110.158.220:3000")

const handler = args => {
  const path = require(`path`)
  const newPath = path.join(`blue`, `moon`)
  return { "Math!": args.a + args.b * Math.random(), path: newPath }
}

const args = { a: 2111, b: 2 }

socket.on("connect", function () {
  socket.emit(`setTaskRunner`, fs.readFileSync(`./remote-task-runner.js`))
  console.time(`runTask`)
  socket.emit(`runTask`, {
    handler: handler.toString(),
    args,
  })

  socket.on(`response`, res => {
    console.log({ res })
    console.timeEnd(`runTask`)
  })
})
socket.on("disconnect", function () {})
