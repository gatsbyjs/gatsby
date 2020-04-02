import path from "path"
import respawn from "respawn"
import chokidar from "chokidar"
import resolveCwd from "resolve-cwd"
import getPort from "get-port"
import report from "gatsby-cli/lib/reporter"
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

module.exports = async (program: IProgram): Promise<void> => {
  const developProcessPath = resolveCwd.silent(
    `gatsby/dist/commands/develop-process`
  )
  // Run the actual develop server on a random port, and the proxy on the program port
  // which users will access
  const userPort = program.port
  const randomPort = await getPort()
  console.log({ userPort, randomPort })
  const script = createControllableScript(report.stripIndent`
    const cmd = require("${developProcessPath}");
    const args = ${JSON.stringify({
      ...program,
      port: randomPort,
    })};
    cmd(args);
  `)

  startDevelopProxy({
    proxyPort: userPort,
    targetPort: randomPort,
  })

  script.start()

  chokidar
    .watch([rootFile(`gatsby-config.js`), rootFile(`gatsby-node.js`)])
    .on(`change`, filePath => {
      const activity = report.activityTimer(
        `${path.basename(filePath)} changed, restarting gatsby develop`
      )
      activity.start()
      script.stop(() => {
        activity.end()
        script.start()
      })
    })
}
