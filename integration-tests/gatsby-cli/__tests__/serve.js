import { GatsbyCLI } from "../test-helpers"

const timeout = seconds =>
  new Promise(resolve => {
    setTimeout(resolve, seconds * 1000)
  })

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby serve`, () => {
  const cwd = `gatsby-sites/gatsby-develop`

  beforeAll(async () => {
    await GatsbyCLI.from(cwd).invoke(`clean`)
    await GatsbyCLI.from(cwd).invoke(`build`)
  })
  afterAll(() => GatsbyCLI.from(cwd).invoke(`clean`))

  it(`starts a gatsby server on port 9000`, async () => {
    // 1. Start the `gatsby serve` command
    const [childProcess, getLogs] = GatsbyCLI.from(cwd).invokeAsync(
      `serve`,
      log => log.includes(`http://localhost:9000/`)
    )

    // // 2. kill the `gatsby serve` command so we can get logs
    await childProcess

    // 3. Make sure logs for the user contain expected results
    const logs = getLogs()
    logs.should.contain(
      `You can now view gatsby-starter-default-develop in the browser.`
    )
    logs.should.contain(` http://localhost:9000/`)
  })

  it(`starts a gatsby site on port 9001 with -p 9001`, async () => {
    // 1. Start the `gatsby serve` command
    const [childProcess, getLogs] = GatsbyCLI.from(cwd).invokeAsync(
      [`serve`, `-p9001`],
      log => log.includes(`http://localhost:9001/`)
    )

    // // 2. kill the `gatsby serve` command so we can get logs
    await childProcess

    // 3. Make sure logs for the user contain expected results
    const logs = getLogs()
    logs.should.contain(
      `You can now view gatsby-starter-default-develop in the browser.`
    )
    logs.should.contain(` http://localhost:9001/`)
  })

  it.skip(`starts a gatsby site at a different host with --host`, async () => {
    // TODO: figure out how to deal with EADDRNOTAVAIL when express starts with a hostname
    // 1. Start the `gatsby serve` command
    const [childProcess, getLogs] = GatsbyCLI.from(cwd).invokeAsync(
      [`serve`, `--host=not.localhost.com`],
      log => log.includes(`http://not.localhost.com:9000/`)
    )

    // // 2. kill the `gatsby serve` command so we can get logs
    await childProcess

    // 3. Make sure logs for the user contain expected results
    const logs = getLogs()
    logs.should.contain(
      `You can now view gatsby-starter-default-develop in the browser.`
    )
    logs.should.contain(` http://not.localhost.com:9000/`)
  })

  it(`starts a gatsby site with ssl using --https`, async () => {
    // 1. Start the `gatsby serve` command
    const [childProcess, getLogs] = GatsbyCLI.from(cwd).invokeAsync(
      [`serve`, `--https`],
      log => log.includes(`https://localhost:9000/`)
    )

    // // 2. kill the `gatsby serve` command so we can get logs
    await childProcess

    // 3. Make sure logs for the user contain expected results
    const logs = getLogs()
    logs.should.contain(
      `You can now view gatsby-starter-default-develop in the browser.`
    )
    logs.should.contain(` https://localhost:9000/`)
  })

  it.skip(`starts a gatsby site with cert file using -c`, () => {})
  it.skip(`starts a gatsby site with key file using -k`, () => {})
  it.skip(`starts a gatsby site with -open-tracing-config-file`, () => {})
})
