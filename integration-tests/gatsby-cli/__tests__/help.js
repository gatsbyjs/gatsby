import { GatsbyCLI } from "../test-helpers"

describe(`gatsby`, () => {
  it(`shows help when called without a command`, () => {
    const [status, logs] = GatsbyCLI.from(`gatsby-sites/gatsby-build`).invoke([])

    logs.should.contain(`Usage: gatsby <command> [options]`)
    logs.should.contain(`gatsby develop`)
    expect(status).toBe(0)
  })
})
