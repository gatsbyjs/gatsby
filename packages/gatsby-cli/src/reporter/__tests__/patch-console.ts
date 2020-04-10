import { patchConsole } from "../patch-console"
import { reporter as gatsbyReporter } from "../reporter"

describe(`patchConsole`, () => {
  const reporter = {
    log: jest.fn(),
  }
  patchConsole((reporter as unknown) as typeof gatsbyReporter)

  beforeEach(reporter.log.mockReset)

  it(`handles an empty call`, () => {
    console.log()

    // intentionally empty arguments
    expect(reporter.log).toBeCalledWith()
  })

  it(`handles multiple arguments`, () => {
    console.log(`foo`, `bar`, `baz`)

    expect(reporter.log).toBeCalledWith(`foo bar baz`)
  })

  it(`handles formatting`, () => {
    console.log(`%s %d`, `bar`, true)

    expect(reporter.log).toBeCalledWith(`bar 1`)
  })
})
