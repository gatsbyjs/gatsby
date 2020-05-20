import execa from "execa"
import * as path from "path"
import * as fs from "fs"
import detectPort from "detect-port"
import {
  getService,
  createServiceLock,
} from "gatsby-core-utils/dist/service-lock"

const startGraphQLServer = async programPath => {
  let port = await getService(programPath, `recipesgraphqlserver`)

  if (!port) {
    port = await detectPort(4000)
    await createServiceLock(programPath, `recipesgraphqlserver`, port)

    const subprocess = execa(`node`, [require.resolve(`./server.js`), port], {
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
  }

  return {
    port,
  }
}

export default startGraphQLServer
