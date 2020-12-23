// The worker
const io = require("socket.io")(3000)
const fs = require(`fs-extra`)

let lastTaskRunner = Buffer.alloc(1)

io.on("connection", socket => {
  console.log(`connection`)
  let taskRunner
  socket.on(`setTaskRunner`, function (taskRunnerStr) {
    fs.ensureDirSync(`./.cache/`)
    if (Buffer.compare(lastTaskRunner, taskRunnerStr)) {
      lastTaskRunner = taskRunnerStr
      fs.writeFileSync(`./.cache/task-runner.js`, taskRunnerStr)
      delete require.cache[require.resolve(`./.cache/task-runner.js`)]
    }
    taskRunner = require(`./.cache/task-runner.js`)
    taskRunner.init(socket)
    socket.emit(`serverReady`)
  })

  socket.on(`runTask`, async function (task) {
    taskRunner.runTask(task)
  })
})
