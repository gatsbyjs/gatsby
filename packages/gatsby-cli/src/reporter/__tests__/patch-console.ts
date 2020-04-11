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

  it("handles normal values", () => {
    console.log(1)
    console.log(0)
    console.log(true)
    console.log(false)
    console.log([1, true, false, {}])
    console.log({ 1: 1, true: true, false: "false", obj: {} })

    expect(reporter.log.mock.calls[0][0]).toBe(`1`)
    expect(reporter.log.mock.calls[1][0]).toBe(`0`)
    expect(reporter.log.mock.calls[2][0]).toBe(`true`)
    expect(reporter.log.mock.calls[3][0]).toBe(`false`)
    expect(reporter.log.mock.calls[4][0]).toBe("[ 1, true, false, {} ]")
    expect(reporter.log.mock.calls[5][0]).toBe(
      "{ '1': 1, true: true, false: 'false', obj: {} }"
    )
  })
})
