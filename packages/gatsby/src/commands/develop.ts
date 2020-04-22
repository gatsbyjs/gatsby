import path from "path"
import http from "http"
import os from "os"
import crypto from "crypto"
import respawn from "respawn"
import chokidar from "chokidar"
import resolveCwd from "resolve-cwd"
import getRandomPort from "get-port"
import report from "gatsby-cli/lib/reporter"
import socket from "socket.io"
import lockFile from "lockfile"
import fse from "fs-extra"
import util from "util"
import { startDevelopProxy } from "../utils/develop-proxy"
import { IProgram } from "./types"

const rootFile = (filePath: string): string =>
  path.join(process.cwd(), filePath)

interface IRespawnMonitor {
  start: () => void
  stop: (callback: () => void) => void
  status: "running" | "stopping" | "stopped" | "crashed" | "sleeping"
}

const createControllableScript = (script: string): IRespawnMonitor => {
  const tmpFile = require(`tmp`).fileSync()
  require(`fs`).writeFileSync(tmpFile.name, script)

  return respawn([`node`, tmpFile.name], {
    env: process.env,
    stdio: `inherit`,
  })
}

const globalConfigPath =
  process.env.XDG_CONFIG_HOME || path.join(os.homedir(), `.config`)
const lock = util.promisify(lockFile.lock)

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
  })

  const wsServerPort = await getRandomPort()
  const wsServer = http.createServer().listen(wsServerPort)

  const hash = crypto
    .createHash(`md5`)
    .update(program.directory)
    .digest(`hex`)

  const wsLockfileDir = path.join(globalConfigPath, `gatsby`, `sites`, hash)

  await fse.ensureDir(wsLockfileDir)
  const wsLockfilePath = path.join(wsLockfileDir, `ws.lock`)

  try {
    await lock(wsLockfilePath, {})
  } catch (err) {
    console.log(err)
    // TODO: Nice helpful error message
    throw new Error(`Another process probably already running.`)
  }

  await fse.writeFile(wsLockfilePath, wsServerPort)

  const io = socket(wsServer)

  io.on(`connection`, socket => {
    socket.on(`gatsby:develop:do-restart`, () => {
      const activity = report.activityTimer(`Restarting develop process...`)
      activity.start()
      script.stop(() => {
        activity.end()
        script.start()
        io.emit(`gatsby:develop:restarted`)
      })
    })
  })

  script.start()
  io.emit(`gatsby:develop:restarted`)

  chokidar
    .watch([rootFile(`gatsby-config.js`), rootFile(`gatsby-node.js`)])
    .on(`change`, filePath => {
      console.log(`${path.basename(filePath)} changed`)
      io.emit(`gatsby:develop:needs-restart`, {
        reason: `${path.basename(filePath)} changed`,
      })
    })
}
