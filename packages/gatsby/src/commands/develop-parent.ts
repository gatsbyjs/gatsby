import path from "path"
import http from "http"
import respawn from "respawn"
import chokidar from "chokidar"
import resolveCwd from "resolve-cwd"
import getRandomPort from "get-port"
import report from "gatsby-cli/lib/reporter"
import socket from "socket.io"
import { createServiceLock } from "gatsby-core-utils"
import { startDevelopProxy } from "../utils/develop-proxy"
import { IProgram } from "./types"

const rootFile = (filePath: string): string =>
  path.join(process.cwd(), filePath)

// Copied from https://stackoverflow.com/a/16060619
const requireUncached: NodeRequire = file => {
  delete require.cache[require.resolve(file)]
  return require(file)
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

interface IRespawnMonitor {
  start: () => void
  stop: (callback: () => void) => void
  status: "running" | "stopping" | "stopped" | "crashed" | "sleeping"
  on: (type: string, callback: Function) => void
}

const createControllableScript = (script: string): IRespawnMonitor => {
  const tmpFile = require(`tmp`).fileSync()
  require(`fs`).writeFileSync(tmpFile.name, script)

  return respawn([`node`, tmpFile.name], {
    env: process.env,
    stdio: [`inherit`, `inherit`, `inherit`, `ipc`],
  })
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

  const wsServerPort = await getRandomPort()

  await createServiceLock(program.directory, `ws`, wsServerPort.toString())

  const wsServer = http.createServer().listen(wsServerPort)
  const io = socket(wsServer)

  io.on(`connection`, socket => {
    socket.on(`develop:restart`, () => {
      const activity = report.activityTimer(`Restarting develop process...`)
      activity.start()
      script.stop(() => {
        activity.end()
        script.start()
      })
    })
  })

  script.on(`message`, msg => {
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
  script.start()

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
