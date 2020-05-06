import path from "path"
import http from "http"
import tmp from "tmp"
import { spawn } from "child_process"
import chokidar from "chokidar"
import resolveCwd from "resolve-cwd"
import getRandomPort from "get-port"
import report from "gatsby-cli/lib/reporter"
import socket from "socket.io"
import fs from "fs-extra"
import { createServiceLock } from "gatsby-core-utils/dist/service-lock"
import { startDevelopProxy } from "../utils/develop-proxy"
import { IProgram } from "./types"
import { Signal } from "signal-exit"

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
  constructor(script) {
    this.tmpFile = tmp.fileSync()
    fs.writeFileSync(this.tmpFile.name, script)
  }
  start(): void {
    this.process = spawn(`node`, [this.tmpFile.name], {
      env: process.env,
      stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
    })
  }
  stop(signal?: string): void {
    this.process.kill(signal)
  }
  on(type, callback): void {
    this.process.on(type, callback)
  }
}

const createControllableScript = (script: string): ControllableScript => {
  const controllableScript = new ControllableScript(script)
  return controllableScript
}

module.exports = async (program: IProgram): Promise<void> => {
  const developProcessPath = resolveCwd.silent(
    `gatsby/dist/commands/develop-process`
  )
  // Run the actual develop server on a random port, and the proxy on the program port
  // which users will access
  const proxyPort = program.port
  const developPort = await getRandomPort()

  const script = createControllableScript(report.stripIndent`
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

  const success = await createServiceLock(
    program.directory,
    `developstatusserver`,
    statusServerPort.toString()
  )

  if (!success) {
    report.error(
      `It looks like a develop process for this site is already running.`
    )
    process.exit(1)
  }

  const statusServer = http.createServer().listen(statusServerPort)
  const io = socket(statusServer)

  io.on(`connection`, socket => {
    socket.on(`develop:restart`, () => {
      const activity = report.activityTimer(`Restarting develop process...`)
      activity.start()
      script.stop()
      activity.end()
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

  process.on(`exit`, () => script.stop())

  process.on(`SIGINT`, () => script.stop(`SIGINT`))
  process.on(`SIGTERM`, () => script.stop(`SIGTERM`))

  const rootFile = (file: string): string => path.join(program.directory, file)

  const files = [rootFile(`gatsby-config.js`), rootFile(`gatsby-node.js`)]
  let lastConfig = requireUncached(rootFile(`gatsby-config.js`))

  chokidar.watch(files).on(`change`, filePath => {
    const file = path.basename(filePath)

    if (file === `gatsby-config.js`) {
      const newConfig = requireUncached(rootFile(`gatsby-config.js`))

      if (!doesConfigChangeRequireRestart(lastConfig, newConfig)) {
        lastConfig = newConfig
        return
      }

      lastConfig = newConfig
    }

    report.warn(
      `develop process needs to be restarted to apply the changes to ${file}`
    )
    io.emit(`develop:needs-restart`, {
      dirtyFile: file,
    })
  })
}
