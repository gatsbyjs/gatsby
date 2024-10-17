import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby options`, () => {
  it(`Prints the options`, () => {
    const [status, logs] = GatsbyCLI.from(`gatsby-sites/gatsby-build`).invoke(
      `options`
    )

    logs.should.contain(`Package Manager`)
    expect(status).toBe(0)
  })
})
