import { patchConsole } from "../patch-console"
import { reporter as gatsbyReporter } from "../reporter"

describe(`patchConsole`, () => {
  const reporter = {
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  }

  patchConsole(reporter as unknown as typeof gatsbyReporter)
  ;[`info`, `log`, `warn`].forEach(method => {
    describe(method, () => {
      beforeEach(reporter[method].mockReset)

      it(`handles an empty call`, () => {
        console[method]()

        expect(reporter[method]).toBeCalledWith(``)
      })

      it(`handles multiple arguments`, () => {
        console[method](`foo`, `bar`, `baz`)

        expect(reporter[method]).toBeCalledWith(`foo bar baz`)
      })

      it(`handles formatting`, () => {
        console[method](`%s %d`, `bar`, true)

        expect(reporter[method]).toBeCalledWith(`bar 1`)
      })

      it(`handles normal values`, () => {
        console[method](1)
        console[method](0)
        console[method](true)
        console[method](false)
        console[method]([1, true, false, {}])
        console[method]({ 1: 1, true: true, false: `false`, obj: {} })

        expect(reporter[method].mock.calls[0][0]).toBe(`1`)
        expect(reporter[method].mock.calls[1][0]).toBe(`0`)
        expect(reporter[method].mock.calls[2][0]).toBe(`true`)
        expect(reporter[method].mock.calls[3][0]).toBe(`false`)
        expect(reporter[method].mock.calls[4][0]).toBe(`[ 1, true, false, {} ]`)
        expect(reporter[method].mock.calls[5][0]).toBe(
          `{ '1': 1, true: true, false: 'false', obj: {} }`
        )
      })

      it(`handles undefined variables`, () => {
        let a
        console[method](a)

        expect(reporter[method]).toBeCalledWith(``)
      })
    })
  })
})
