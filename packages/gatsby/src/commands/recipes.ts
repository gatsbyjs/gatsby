import telemetry from "gatsby-telemetry"
import execa from "execa"
import path from "path"
import fs from "fs"

module.exports = async (program: IProgram): Promise<void> => {
  const recipe = program._[1]
  telemetry.trackCli(`RECIPE_RUN`, { recipe })

  // Start GraphQL serve
  let subprocess
  const scriptPath = path.join(program.directory, `node_modules/gatsby/dist/recipes/graphql.js`)
  subprocess = execa(`node`, [scriptPath], {
    cwd: program.directory,
    all: true,
  })
  process.on("exit", () =>
    subprocess.kill("SIGTERM", {
      forceKillAfterTimeout: 2000,
    })
  )
  // Log server output to a file.
  if (process.env.DEBUG) {
    const logFile = path.join(program.directory, './recipe-server.log')
    fs.writeFileSync(logFile, `\n-----\n${new Date().toJSON()}\n`)
    const writeStream = fs.createWriteStream(logFile, {flags:'a'});
    subprocess.stdout.pipe(writeStream)
  }

  let started = false
  subprocess.stdout.on("data", data => {
    if (!started) {
      const runRecipe = require(`../recipes/index`)
      runRecipe({ recipe, projectRoot: program.directory })
      started = true
    }
  })

  // Run command
}
