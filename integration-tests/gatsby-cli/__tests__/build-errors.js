import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby build (errors)`, () => {
  const cwd = `gatsby-sites/gatsby-build-errors`

  beforeAll(() => GatsbyCLI.from(cwd).invoke(`clean`))
  afterAll(() => GatsbyCLI.from(cwd).invoke(`clean`))

  it(`should log build errors with useful outputs`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke(`build`)

    // Generic logging header
    logs.should.contain(`failed Building static HTML for pages`)
    logs.should.contain(`ERROR #95313`)
    logs.should.contain(`Building static HTML failed`)
    logs.should.contain(
      `See our docs page for more info on this error: https://gatsby.dev/debug-html`
    )

    // Source map should be printed:
    logs.should.contain(`  3 | // This should intentionally fail`)
    logs.should.contain(`  4 | const foo = null`)
    logs.should.contain(`> 5 | foo.bar()`)
    logs.should.contain(`    |     ^`)
    logs.should.contain(`  6 |`)
    logs.should.contain(`  7 | export default () => <div>Hi</div>`)
    logs.should.contain(`  8 |`)

    // Stack trace
    logs.should.contain(
      `WebpackError: TypeError: Cannot read properties of null (reading 'bar')`
    )
    logs.should.contain(`- index.js:5`)
    logs.should.contain(
      `  gatsby-starter-default-build-errors/src/pages/index.js:5:5`
    )

    expect(code).not.toBe(0)
  })
})
