const { createServiceLock } = require(`gatsby-core-utils/dist/service-lock`)
const execa = require(`execa`)

const startServer = async () => {
  // Use 50400 as our port as it's a highly composite number! Meaning it has
  // more divisors than any smaller positive integer.
  const port = 50400
  await createServiceLock(process.cwd(), `recipesgraphqlserver`, { port })

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

  // eslint-disable-next-line no-unused-expressions
  subprocess.stdout?.on(`data`, data => {
    console.log(data.toString())
  })

  process.on(`exit`, () => {
    subprocess.kill(`SIGTERM`, {
      forceKillAfterTimeout: 2000,
    })
  })
}

startServer()
