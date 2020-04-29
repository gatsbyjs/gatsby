import execa from "execa"
import * as path from "path"
import * as fs from "fs"
import detectPort from "detect-port"

const startGraphQLServer = async () => {
  // We don't really care what port is used for GraphQL as it's
  // generally only for code to code communication or debugging.
  const graphqlPort = await detectPort(4000)

  const subprocess = execa(
    `node`,
    [require.resolve(`./server.js`), graphqlPort],
    {
      all: true,
      env: {
        // Chalk doesn't want to output color in a child process
        // as it (correctly) thinks it's not in a normal terminal environemnt.
        // Since we're just returning data, we'll override that.
        FORCE_COLOR: `true`,
      },
    }
  )

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

  return {
    process: subprocess,
    port: graphqlPort,
  }
}

export default startGraphQLServer
