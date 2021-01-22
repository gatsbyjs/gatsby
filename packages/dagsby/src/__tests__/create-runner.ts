import createRunner from "../create-runner"
import createTask from "../create-task"
import path from "path"
const execa = require(`execa`)
const uuid = require(`uuid`)
const detectPort = require(`detect-port`)
import os from "os"
import fs from "fs-extra"

describe(`create runner`, () => {
  it(`creates a runner`, async () => {
    const httpPort = await detectPort(6898)
    const socketPort = await detectPort(7899)
    const numWorkers = 1
    // Create a temporary directory
    const id = uuid.v4()
    const directory = path.join(os.tmpdir(), id)
    fs.ensureDirSync(directory)
    const workerPool = execa.node(
      path.join(__dirname, `../../dist/worker-pool-server.js`),
      [
        `--numWorkers`,
        numWorkers,
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
    const runner = await createRunner({ pools: [{ socketPort, httpPort }] })

    expect(runner.WORKER_HOST).toBeTruthy()
    expect(runner.WORKER_SOCKET_HOST).toBeTruthy()
    expect(runner.socket.io).toBeTruthy()
  })

  it(`lets you setup tasks`, async () => {
    const httpPort = await detectPort(6898)
    const socketPort = await detectPort(7899)
    const numWorkers = 1
    // Create a temporary directory
    const id = uuid.v4()
    const directory = path.join(os.tmpdir(), id)
    fs.ensureDirSync(directory)
    const workerPool = execa.node(
      path.join(__dirname, `../../dist/worker-pool-server.js`),
      [
        `--numWorkers`,
        numWorkers,
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
    const runner = await createRunner({ pools: [{ socketPort, httpPort }] })

    const task = await createTask({
      func: () => `hi`,
      dependencies: {
        lodash: `latest`,
      },
    })
    await runner.setupTask(task)
  })
})
