import { trackCli } from "gatsby-telemetry"
import execa from "execa"
import * as path from "path"
import * as fs from "fs"
import detectPort from "detect-port"

export async function recipesHandler(recipe: string): Promise<void> {
  // We don't really care what port is used for GraphQL as it's
  // generally only for code to code communication or debugging.
  const graphqlPort = await detectPort(4000)
  trackCli(`RECIPE_RUN`, { name: recipe })

  // Start GraphQL serve
  const scriptPath = require.resolve(`gatsby-recipes/dist/graphql.js`)

  const subprocess = execa(`node`, [scriptPath, graphqlPort], {
    all: true,
    env: {
      // Chalk doesn't want to output color in a child process
      // as it (correctly) thinks it's not in a normal terminal environemnt.
      // Since we're just returning data, we'll override that.
      FORCE_COLOR: `true`,
    },
  })

  // eslint-disable-next-line no-unused-expressions
  subprocess.stderr?.on(`data`, data => {
    console.log(data.toString())
  })

  process.on(`exit`, () => {
    subprocess.kill(`SIGTERM`, {
      forceKillAfterTimeout: 2000,
    })
  })

  // Log server output to a file.
  if (process.env.DEBUG) {
    const logFile = path.resolve(`./recipe-server.log`)
    fs.writeFileSync(logFile, `\n-----\n${new Date().toJSON()}\n`)
    const writeStream = fs.createWriteStream(logFile, { flags: `a` })
    // eslint-disable-next-line no-unused-expressions
    subprocess.stdout?.pipe(writeStream)
  }

  let started = false
  // eslint-disable-next-line no-unused-expressions
  subprocess.stdout?.on(`data`, () => {
    if (!started) {
      const runRecipe = require(`gatsby-recipes/dist/index.js`)
      runRecipe({ recipe, graphqlPort, projectRoot: process.cwd() })
      started = true
    }
  })

  return subprocess.then(() => {})
}
