jest.mock(`common-tags`, () => {
  return {
    stripIndent: args => args,
  }
})

import { onRenderBody } from "../gatsby-ssr"

describe(`gatsby-plugin-facebook-analytics`, () => {
  describe(`onRenderBody`, () => {
    describe(`in development mode`, () => {
      it(`does not set any post body components`, () => {
        const setPostBodyComponents = jest.fn()

        onRenderBody({ setPostBodyComponents }, {})

        expect(setPostBodyComponents).not.toHaveBeenCalled()
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

      it(`sets the correct post body components`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1 }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })

      it(`sets the correct script src during debug`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1, debug: true }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })

      it(`sets the correct script src for other languages than en_US`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1, language: `sv` }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })
    })
  })
})
