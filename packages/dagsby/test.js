const path = require(`path`)

const Runner = require("./dist/index")
const runner = Runner({ pools: [{ socketPort: 6899, httpPort: 6898 }] })

;(async () => {
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

  const result = await Promise.all([promise, promise2, promise3])
  console.log(`hi`, { result })
})()
