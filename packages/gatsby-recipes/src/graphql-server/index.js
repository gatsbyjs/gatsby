const execa = require(`execa`)
const path = require(`path`)
const fs = require(`fs`)
const detectPort = require(`detect-port`)
const {
  getService,
  createServiceLock,
} = require(`gatsby-core-utils/dist/service-lock`)

// NOTE(@mxstbr): The forceStart boolean enforces us to start the recipes graphql server
// even if another instance might already be running. This is necessary to ensure the gatsby
// develop command does not _not_ run the server if the user is running gatsby recipes at the same time.
exports.startGraphQLServer = async (programPath, forceStart) => {
  let { port } = (await getService(programPath, `recipesgraphqlserver`)) || {}

  if (!port || forceStart) {
    port = await detectPort(4000)
    await createServiceLock(programPath, `recipesgraphqlserver`, { port })

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
