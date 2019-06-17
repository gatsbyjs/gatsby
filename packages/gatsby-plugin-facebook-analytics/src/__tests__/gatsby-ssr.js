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

      it(`sets the correct SDK version when set in the config`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1, version: `v3.3` }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })

      it(`sets the existing SDK version as default when no version is set in config`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1 }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })

      it(`sets the correct xfbml value when set in the config`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1, xfbml: false }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })

      it(`sets xfbml to true by default`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1 }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })

      it(`sets the correct cookie value when set in the config`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1, cookie: true }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })

      it(`sets cookie to false by default`, () => {
        const setPostBodyComponents = jest.fn()
        const pluginOptions = { appId: 1 }

        onRenderBody({ setPostBodyComponents }, pluginOptions)

        expect(setPostBodyComponents.mock.calls).toMatchSnapshot()
      })
    })
  })
})
