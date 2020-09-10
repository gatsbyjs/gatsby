import { GatsbyCLI } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

const cwd = `execution-folder`


describe(`gatsby config`, () => {
  it(`Prints the config`, () => {
    const [status, logs] = GatsbyCLI.from(cwd).invoke(
      `config`
    )

    logs.should.contain(
      `packagemanager`
    )
    logs.should.contain(
      `telemetry`
    )
    expect(status).toBe(0)
  })
})
