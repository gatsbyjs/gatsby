// create worker & import library and run a
import Runner from "../index"
const uuid = require("uuid")
import fs from "fs-extra"
import path from "path"
import os from "os"
const execa = require("execa")
const detectPort = require(`detect-port`)

let runner
let workerPool
describe(`runs tasks`, () => {
  beforeAll(async () => {
    // Create a temporary directory
    const id = uuid.v4()
    const directory = path.join(os.tmpdir(), id)
    fs.ensureDirSync(directory)

    const httpPort = await detectPort(6898)
    const socketPort = await detectPort(6899)

    workerPool = execa.node(
      path.join(__dirname, `../../dist/worker-pool-server.js`),
      [
        `--numWorkers`,
        1,
        `--directory`,
        directory,
        `--socketPort`,
        socketPort,
        `--httpPort`,
        httpPort,
      ]
    )

    workerPool.stdout.pipe(process.stdout)
    workerPool.stderr.pipe(process.stderr)
    runner = Runner({ pools: [{ socketPort, httpPort }] })
    return runner
  })

  afterAll(async () => {
    runner.destroy()
  })

  it(`runs a simple task`, async () => {
    const result = await runner.runTask({
      func: args => args.a + args.b,
      args: {
        a: 1,
        b: 2,
      },
    })
    expect(result).toHaveProperty(`executionTime`)
    expect(result.result).toBe(3)
  })

  it(`runs multiple simple tasks`, async () => {
    const promise1 = runner.runTask({
      func: args => args.a + args.b,
      args: {
        a: 2,
        b: 2,
      },
    })
    const promise2 = runner.runTask({
      func: args => `Hello ${args.name}`,
      args: {
        name: `World`,
      },
    })
    const promise3 = runner.runTask({
      func: args => `Hello ${args.name}`,
      args: {
        name: `Hal`,
      },
    })

    const [result, result2, result3] = await Promise.all([
      promise1,
      promise2,
      promise3,
    ])

    expect(result).toHaveProperty(`executionTime`)
    expect(result2).toHaveProperty(`executionTime`)
    expect(result.result).toBe(4)
    expect(result2.result).toBe(`Hello World`)
    expect(result3.result).toBe(`Hello Hal`)
  })

  it(`supports uploading files to be used for the task`, async () => {
    const result = await runner.runTask({
      func: (args, { files }) => {
        const fs = require(`fs`)
        const text = fs.readFileSync(files.text.localPath)

        return `${args.preface} ${text}`
      },
      args: { preface: `yeeesss` },
      files: {
        text: {
          originPath: path.join(__dirname, `mocks`, `hello.txt`),
        },
      },
    })

    expect(result.result).toMatchSnapshot()
  })

  it(`supports tasks declaring dependencies`, async () => {
    const result = await runner.runTask({
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
          originPath: path.join(__dirname, `mocks`, `hello.txt`),
        },
      },
    })

    expect(result.result).toMatchSnapshot()
  })
})
