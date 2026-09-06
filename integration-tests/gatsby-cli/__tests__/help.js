import { GatsbyCLI } from "../test-helpers"

const expectHelp = args => {
  const [status, logs] = GatsbyCLI.from(`gatsby-sites/gatsby-build`).invoke(
    args
  )

  logs.should.contain(`Usage: gatsby <command> [options]`)
  logs.should.contain(`gatsby develop`)
  expect(status).toBe(0)
}

describe(`gatsby`, () => {
  it(`shows help when called without a command`, () => {
    expectHelp([])
  })

  it(`shows help when called with global options but no command`, () => {
    expectHelp([`--verbose`])
  })
})
