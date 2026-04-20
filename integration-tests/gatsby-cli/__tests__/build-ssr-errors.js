import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby build (SSR errors)`, () => {
  const cwd = `gatsby-sites/gatsby-build-ssr-errors`

  beforeAll(() => GatsbyCLI.from(cwd).invoke(`clean`))
  afterAll(() => GatsbyCLI.from(cwd).invoke(`clean`))

  it(`should log build errors with useful outputs`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke(`build`)

    // Generic logging header
    logs.should.contain(`failed Building static HTML for pages`)
    logs.should.contain(`ERROR #95312`)
    logs.should.contain(
      `"window" is not available during server-side rendering.`
    )
    logs.should.contain(
      `See our docs page for more info on this error: https://gatsby.dev/debug-html`
    )

    // // Source map should be printed:
    logs.should.contain(
      `  1 | // This will cause an error during SSR because window is not defined`
    )
    logs.should.contain(`  2 | exports.onPreRenderHTML = () => {`)
    logs.should.contain(`> 3 |   window.location.pathname`)
    logs.should.contain(`    |   ^`)
    logs.should.contain(`  4 | }`)
    logs.should.contain(`  5 |`)

    // // Stack trace
    logs.should.contain(`WebpackError: ReferenceError: window is not defined`)
    logs.should.contain(`- gatsby-ssr.js:3`)
    logs.should.contain(
      `  gatsby-starter-default-build-ssr-errors/gatsby-ssr.js:3:3`
    )

    expect(code).not.toBe(0)
  })
})
