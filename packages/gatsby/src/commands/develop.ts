import path from "path"
import http from "http"
import tmp from "tmp"
import { spawn } from "child_process"
import chokidar from "chokidar"
import resolveCwd from "resolve-cwd"
import getRandomPort from "get-port"
import socket from "socket.io"
import fs from "fs-extra"
// import { createServiceLock } from "gatsby-core-utils/dist/service-lock"
import { startDevelopProxy } from "../utils/develop-proxy"
import { IProgram } from "./types"

// Adapted from https://stackoverflow.com/a/16060619
const requireUncached = (file: string): any => {
  try {
    delete require.cache[require.resolve(file)]
  } catch (e) {
    return null
  }

  try {
    return require(file)
  } catch (e) {
    return null
  }
}

// Heuristics for gatsby-config.js, as not all changes to it require a full restart to take effect
const doesConfigChangeRequireRestart = (
  lastConfig: Record<string, any>,
  newConfig: Record<string, any>
): boolean => {
  // Ignore changes to siteMetadata
  if (
    JSON.stringify({ ...lastConfig, siteMetadata: null }) ===
    JSON.stringify({ ...newConfig, siteMetadata: null })
  )
    return false

  return true
}

class ControllableScript {
  private process
  private tmpFile
  public isRunning
  constructor(script) {
    this.tmpFile = tmp.fileSync()
    fs.writeFileSync(this.tmpFile.name, script)
  }
  start(): void {
    this.isRunning = true
    this.process = spawn(`node`, [this.tmpFile.name], {
      env: process.env,
      stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
    })
  }
  async stop(signal: string | null = null, code?: number): Promise<void> {
    this.isRunning = false
    if (signal) {
      this.process.kill(signal)
    } else {
      this.process.exit(code)
    }

    return new Promise(resolve => {
      this.process.on(`exit`, () => {
        this.process.removeAllListeners()
        resolve()
      })
    })
  }
  on(type, callback): void {
    this.process.on(type, callback)
  }
}

module.exports = async (program: IProgram): Promise<void> => {
  const developProcessPath = resolveCwd.silent(
    `gatsby/dist/commands/develop-process`
  )
  // Run the actual develop server on a random port, and the proxy on the program port
  // which users will access
  const proxyPort = program.port
  const developPort = await getRandomPort()

  const script = new ControllableScript(`
    const cmd = require("${developProcessPath}");
    const args = ${JSON.stringify({
      ...program,
      port: developPort,
      proxyPort,
    })};
    cmd(args);
  `)

  const proxy = startDevelopProxy({
    proxyPort: proxyPort,
    targetPort: developPort,
    programPath: program.directory,
  })

  const statusServerPort = await getRandomPort()

  // const success = await createServiceLock(
  //   program.directory,
  //   `developstatusserver`,
  //   statusServerPort.toString()
  // )

  // if (!success) {
  //   report.error(
  //     `It looks like a develop process for this site is already running.`
  //   )
  //   process.exit(1)
  // }

  const statusServer = http.createServer().listen(statusServerPort)
  const io = socket(statusServer)

  io.on(`connection`, socket => {
    socket.on(`develop:restart`, () => {
      script.stop()
      script.start()
    })
  })

  script.start()

  script.on(`message`, msg => {
    // Forward IPC
    if (process.send) process.send(msg)

    if (
      msg.type === `LOG_ACTION` &&
      msg.action.type === `SET_STATUS` &&
      msg.action.payload === `IN_PROGRESS`
    ) {
      proxy.serveRestartingScreen()
      io.emit(`develop:is-starting`)
    }

    if (
      msg.type === `LOG_ACTION` &&
      msg.action.type === `SET_STATUS` &&
      msg.action.payload === `SUCCESS`
    ) {
      proxy.serveSite()
      io.emit(`develop:started`)
    }
  })

  script.on(`exit`, code => {
    process.exit(code)
  })

  const rootFile = (file: string): string => path.join(program.directory, file)

  const files = [rootFile(`gatsby-config.js`), rootFile(`gatsby-node.js`)]
  let lastConfig = requireUncached(rootFile(`gatsby-config.js`))

  const watcher = chokidar.watch(files).on(`change`, filePath => {
    const file = path.basename(filePath)

    if (file === `gatsby-config.js`) {
      const newConfig = requireUncached(rootFile(`gatsby-config.js`))

      if (!doesConfigChangeRequireRestart(lastConfig, newConfig)) {
        lastConfig = newConfig
        return
      }

      lastConfig = newConfig
    }

    console.warn(
      `develop process needs to be restarted to apply the changes to ${file}`
    )
    io.emit(`develop:needs-restart`, {
      dirtyFile: file,
    })
  })

  process.on(`beforeExit`, async () => {
    proxy.server.close()
    await watcher.close()
  })

  process.on(`SIGINT`, async () => {
    await script.stop(`SIGINT`)
    process.exit()
  })

  process.on(`SIGTERM`, async () => {
    await script.stop(`SIGTERM`)
    process.exit()
  })
}
