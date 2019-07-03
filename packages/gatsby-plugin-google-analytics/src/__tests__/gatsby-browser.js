import { onRouteUpdate } from "../gatsby-browser"
import { Minimatch } from "minimatch"

jest.useFakeTimers()

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
          window.ga = jest.fn()
          window.requestAnimationFrame = jest.fn(cb => {
            cb()
          })
        })

        it(`does not send page view when ga is undefined`, () => {
          delete window.ga

          onRouteUpdate({})

          expect(window.requestAnimationFrame).not.toHaveBeenCalled()
        })

        it(`does not send page view when path is excluded`, () => {
          const mm = new Minimatch(`/test-pages/**`)
          window.excludeGAPaths = [mm.makeRe()]

          onRouteUpdate({
            location: {
              pathname: `/test-pages/example`,
            },
          })

          expect(window.ga).not.toHaveBeenCalled()
        })

        it(`sends page view`, () => {
          onRouteUpdate({})

          expect(window.ga).toHaveBeenCalledTimes(2)
        })

        it(`uses setTimeout when requestAnimationFrame is undefined`, () => {
          delete window.requestAnimationFrame

          onRouteUpdate({})

          jest.runAllTimers()

          expect(setTimeout).toHaveBeenCalledTimes(1)
          expect(window.ga).toHaveBeenCalledTimes(2)
        })
      })
    })
  })
})
