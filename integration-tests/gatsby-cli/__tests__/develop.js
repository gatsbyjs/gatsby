import spawn from "cross-spawn"
import { GatsbyCLI, removeFolder } from "../test-helpers"
import strip from "strip-ansi"

const timeout = seconds =>
  new Promise(resolve => {
    setTimeout(resolve, seconds * 1000)
  })

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby develop`, () => {
  const cwd = `gatsby-sites/gatsby-develop`

  beforeAll(() => removeFolder(`${cwd}/.cache`))
  beforeAll(() => removeFolder(`${cwd}/public`))
  afterAll(() => removeFolder(`${cwd}/.cache`))
  afterAll(() => removeFolder(`${cwd}/public`))

  it(`starts a gatsby site on port 8000`, async () => {
    // 1. Start the `gatsby develop` command
    const [childProcess, getLogs] = GatsbyCLI.from(cwd).invokeAsync(`develop`)

    // 2. Wait for the build process to finish
    await timeout(10)

    // 3. Get the process identifier for what is running on port 8000
    const res = spawn.sync("lsof", ["-i", ":8000", "-t"])
    const portPID = Number(/\d+/.exec(res.output?.toString())[0])

    // 4. kill the `gatsby develop` command so we can get logs
    spawn.sync("kill", [childProcess.pid])

    // 5. Make sure the process we started was the one on gatsby port
    expect(portPID).toEqual(childProcess.pid)

    // 6. Make sure logs for the user contain expected results
    const logs = getLogs()
    logs.should.contain(`success open and validate gatsby-configs`)
    logs.should.contain(`success load plugins`)
    logs.should.contain(`success onPreInit`)
    logs.should.contain(`success initialize cache`)
    logs.should.contain(`success copy gatsby files`)
    logs.should.contain(`success onPreBootstrap`)
    logs.should.contain(`success createSchemaCustomization`)
    logs.should.contain(`success source and transform nodes`)
    logs.should.contain(`success building schema`)
    logs.should.contain(`success createPages`)
    logs.should.contain(`success createPagesStatefully`)
    logs.should.contain(`success onPreExtractQueries`)
    logs.should.contain(`success update schema`)
    logs.should.contain(`success extract queries from components`)
    logs.should.contain(`success write out requires`)
    logs.should.contain(`success write out redirect data`)
    logs.should.contain(`success onPostBootstrap`)
    logs.should.contain(`info bootstrap finished`)
    logs.should.contain(
      `You can now view gatsby-starter-default in the browser.`
    )
    logs.should.contain(`http://localhost:8000/`)
    logs.should.contain(
      `View GraphiQL, an in-browser IDE, to explore your site's data and schema`
    )
    logs.should.contain(`http://localhost:8000/___graphql`)
    logs.should.contain(`Note that the development build is not optimized.`)
    logs.should.contain(`To create a production build, use gatsby build`)
  })

  it.skip(`starts a gatsby site on port 9000 with -p 9000`, () => {})
  it.skip(`starts a gatsby site at a diffent host with -h`, () => {})
  it.skip(`starts a gatsby site with ssl using -S`, () => {})
  it.skip(`starts a gatsby site with cert file using -c`, () => {})
  it.skip(`starts a gatsby site with key file using -k`, () => {})
  it.skip(`starts a gatsby site with -open-tracing-config-file`, () => {})
})
