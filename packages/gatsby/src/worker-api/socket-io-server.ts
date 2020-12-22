// The worker
const io = require("socket.io")(3000)
const fs = require(`fs-extra`)

io.on("connection", socket => {
  socket.on(`setTaskRunner`, function (taskRunner) {
    fs.ensureDirSync(`./.cache/`)
    fs.writeFileSync(`./.cache/task-runner.js`, taskRunner)
    delete require.cache[require.resolve(`./.cache/task-runner.js`)]
  })

  socket.on(`runTask`, function (task) {
    const taskRunner = require(`./.cache/task-runner.js`)
    console.log({ task, taskRunner })
    socket.emit(`response`, taskRunner.runTask(task))
  })
})
