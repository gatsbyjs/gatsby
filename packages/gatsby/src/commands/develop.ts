import path from "path"
import respawn from "respawn"
import chokidar from "chokidar"
import resolveCwd from "resolve-cwd"
import report from "gatsby-cli/lib/reporter"
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

module.exports = (program: IProgram): void => {
  const developProcess = resolveCwd.silent(
    `gatsby/dist/commands/develop-process`
  )
  const script = createControllableScript(report.stripIndent`
    const cmd = require("${developProcess}");
    const args = ${JSON.stringify(program)};
    cmd(args);
  `)

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
