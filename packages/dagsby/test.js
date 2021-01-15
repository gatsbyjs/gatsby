const path = require(`path`)
const execa = require("execa")
const detectPort = require(`detect-port`)
const uuid = require("uuid")
const os = require(`os`)
const fs = require(`fs-extra`)
const waitOn = require("wait-on")

const Runner = require("./dist/index")
const runner = Runner({ pools: [{ socketPort: 6899, httpPort: 6898 }] })

// Create a temporary directory
const id = uuid.v4()
const directory = path.join(os.tmpdir(), id)
fs.ensureDirSync(directory)
;(async () => {
  const httpPort = await detectPort(6898)
  const socketPort = await detectPort(6899)
  console.log({ httpPort, socketPort })
  const workerPool = execa.node(
    path.join(__dirname, `dist/worker-pool-server.js`),
    [
      `--workers`,
      1,
      `--directory`,
      directory,
      `--socketPort`,
      socketPort,
      `--httpPort`,
      httpPort,
    ]
  )

  console.log(`hi`)

  const promise = runner.runTask({
    func: args => args.a + args.b,
    args: {
      a: 1,
      b: 2,
    },
  })
  const promise2 = runner.runTask({
    func: (args, { files }) => {
      const fs = require(`fs`)
      const text = fs.readFileSync(files.text.localPath)

      return `${args.preface} ${text}`
    },
    args: { preface: `yeeesss` },
    files: {
      text: {
        originPath: path.join(__dirname, `__tests__`, `mocks`, `hello.txt`),
      },
    },
  })

  const promise3 = runner.runTask({
    func: (args, { files }) => {
      const fs = require(`fs`)
      const _ = require(`lodash`)
      const text = fs.readFileSync(files.text.localPath)
      const camelCase = _.camelCase(text)

      return `${args.preface} ${text} \n\n ${camelCase}`
    },
    args: { preface: `yeeesss` },
    dependencies: {
      lodash: `latest`,
    },
    files: {
      text: {
        originPath: path.join(__dirname, `__tests__`, `mocks`, `hello.txt`),
      },
    },
  })

  console.log(`tasks queued`)

  const result = await Promise.all([promise, promise2, promise3])
  console.log(`hi`, { result })
})()
