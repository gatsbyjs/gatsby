/**
 * @jest-environment jsdom
 */

import { onRouteUpdate } from "../gatsby-browser"

describe(`gatsby-plugin-facebook-analytics`, () => {
  describe(`onRouteUpdate`, () => {
    describe(`in development mode`, () => {
      it(`does not log page views`, () => {
        const logPageView = jest.fn()
        window.FB = function () {}
        window.FB.AppEvents = { logPageView }

        onRouteUpdate()

        expect(logPageView).not.toHaveBeenCalled()
      })
    })

    describe(`in production mode`, () => {
      let env

      beforeAll(() => {
        env = process.env.NODE_ENV
        process.env.NODE_ENV = `production`
      })

      afterAll(() => {
        process.env.NODE_ENV = env
      })

      it(`logs page views`, () => {
        const logPageView = jest.fn()
        window.FB = function () {}
        window.FB.AppEvents = { logPageView }

        onRouteUpdate()

        expect(logPageView).toHaveBeenCalledTimes(1)
      })
    })
  })
})
