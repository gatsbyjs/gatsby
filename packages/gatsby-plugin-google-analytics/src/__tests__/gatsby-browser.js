import { onRouteUpdate } from "../gatsby-browser"
import { Minimatch } from "minimatch"

describe(`gatsby-plugin-google-analytics`, () => {
  describe(`gatsby-browser`, () => {
    describe(`onRouteUpdate`, () => {
      describe(`in non-production env`, () => {
        it(`does not send page view`, () => {
          window.ga = jest.fn()

          onRouteUpdate({})

          expect(window.ga).not.toHaveBeenCalled()
        })
      })

      describe(`in production env`, () => {
        let env

        beforeAll(() => {
          env = process.env.NODE_ENV
          process.env.NODE_ENV = `production`
        })

        afterAll(() => {
          process.env.NODE_ENV = env
        })

        beforeEach(() => {
          jest.useFakeTimers()
          window.ga = jest.fn()
        })

        afterEach(() => {
          jest.resetAllMocks()
        })

        it(`does not send page view when ga is undefined`, () => {
          delete window.ga

          onRouteUpdate({})

          jest.runAllTimers()

          expect(setTimeout).not.toHaveBeenCalled()
        })

        it(`does not send page view when path is excluded`, () => {
          const mm = new Minimatch(`/test-pages/**`)
          window.excludeGAPaths = [mm.makeRe()]

          onRouteUpdate({
            location: {
              pathname: `/test-pages/example`,
            },
          })

          jest.runAllTimers()

          expect(window.ga).not.toHaveBeenCalled()
        })

        it(`sends page view`, () => {
          onRouteUpdate({})

          jest.runAllTimers()

          expect(window.ga).toHaveBeenCalledTimes(2)
        })

        it(`uses setTimeout with a minimum delay of 32ms`, () => {
          onRouteUpdate({})

          jest.runAllTimers()

          expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 32)
          expect(window.ga).toHaveBeenCalledTimes(2)
        })

        it(`uses setTimeout with the provided pageTransitionDelay value`, () => {
          onRouteUpdate({}, { pageTransitionDelay: 1000 })

          jest.runAllTimers()

          expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000)
          expect(window.ga).toHaveBeenCalledTimes(2)
        })
      })
    })
  })
})
