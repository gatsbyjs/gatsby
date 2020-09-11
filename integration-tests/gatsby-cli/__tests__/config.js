import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe(`gatsby config`, () => {
  it(`Prints the config`, () => {
    const [status, logs] = GatsbyCLI.from(`gatsby-sites/gatsby-build`).invoke(`config`)

    logs.should.contain(`Package Manager`)
    logs.should.contain(`Telemetry enabled`)
    expect(status).toBe(0)
  })
})
