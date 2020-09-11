import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

const cwd = `execution-folder/gatsby-default`

describe(`gatsby config`, () => {
  it(`Prints the config`, () => {
    const [status, logs] = GatsbyCLI.from(cwd).invoke(`config`)

    logs.should.contain(`Package Manager`)
    logs.should.contain(`Telemetry enabled`)
    expect(status).toBe(0)
  })
})
