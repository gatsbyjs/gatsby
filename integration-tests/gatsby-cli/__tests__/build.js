import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby build`, () => {
  const cwd = `gatsby-sites/gatsby-build`

  beforeAll(() => GatsbyCLI.from(cwd).invoke(`clean`))
  afterAll(() => GatsbyCLI.from(cwd).invoke(`clean`))

  it(`creates a built gatsby site`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke(`build`)

    logs.should.contain(`success load gatsby config`)
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
    logs.should.contain(`success extract queries from components`)
    logs.should.contain(`success write out requires`)
    logs.should.contain(`success write out redirect data`)
    logs.should.contain(`success onPostBootstrap`)
    logs.should.contain(`info bootstrap finished`)
    logs.should.contain(
      `success Building production JavaScript and CSS bundles`
    )
    logs.should.contain(`run queries in workers`)
    logs.should.contain(`success Building static HTML for pages`)
    logs.should.contain(`success onPostBuild`)
    logs.should.contain(`info Done building`)
    expect(code).toBe(0)
  })
})
