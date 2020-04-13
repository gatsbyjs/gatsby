import telemetry from "gatsby-telemetry"
import execa from "execa"
import path from "path"
import fs from "fs"
import detectPort from "detect-port"

module.exports = async (program: IProgram): Promise<void> => {
  const recipe = program._[1]
  // We don't really care what port is used for GraphQL as it's
  // generally only for code 2 code communication or debugging.
  const graphqlPort = await detectPort(4000)
  telemetry.trackCli(`RECIPE_RUN`, { recipe })

      // const runRecipe = require(`../recipes/index`)
      // runRecipe({ recipe, projectRoot: program.directory })

  // Start GraphQL serve
  let subprocess
  const scriptPath = path.join(
    program.directory,
    `node_modules/gatsby/dist/recipes/graphql.js`
  )

  subprocess = execa(`node`, [scriptPath, graphqlPort], {
    cwd: program.directory,
    all: true,
    env: {
      // Chalk doesn't want to output color in a child process
      // as it (correctly) thinks it's not in a normal terminal environemnt.
      // Since we're just returning data, we'll override that.
      FORCE_COLOR: `true`,
    }
  })
  subprocess.stderr.on("data", data => {
    console.log(data.toString())
  })
  process.on("exit", () =>
    subprocess.kill("SIGTERM", {
      forceKillAfterTimeout: 2000,
    })
  )
  // Log server output to a file.
  if (process.env.DEBUG) {
    const logFile = path.join(program.directory, "./recipe-server.log")
    fs.writeFileSync(logFile, `\n-----\n${new Date().toJSON()}\n`)
    const writeStream = fs.createWriteStream(logFile, { flags: "a" })
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
