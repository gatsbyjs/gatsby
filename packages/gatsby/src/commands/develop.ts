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
    })};
    cmd(args);
  `)

  startDevelopProxy({
    proxyPort: proxyPort,
    targetPort: developPort,
    programPath: program.directory,
  })

  const wsServerPort = await getRandomPort()

  await createServiceLock(program.directory, `ws`, wsServerPort.toString())

  const wsServer = http.createServer().listen(wsServerPort)
  const io = socket(wsServer)

  io.on(`connection`, socket => {
    socket.on(`gatsby:develop:do-restart`, () => {
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
      msg.action.payload === `SUCCESS`
    ) {
      io.emit(`gatsby:develop:restarted`)
    }
  })
  script.start()

  chokidar
    .watch([rootFile(`gatsby-config.js`), rootFile(`gatsby-node.js`)])
    .on(`change`, filePath => {
      console.log(`${path.basename(filePath)} changed`)
      io.emit(`gatsby:develop:needs-restart`, {
        reason: `${path.basename(filePath)} changed`,
      })
    })
}
