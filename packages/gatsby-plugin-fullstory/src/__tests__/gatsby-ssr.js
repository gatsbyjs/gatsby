import { onRenderBody } from "../gatsby-ssr"

describe(`gatsby-plugin-fullstory`, () => {
  describe(`onRenderBody`, () => {
    describe(`in development mode`, () => {
      it(`does not set any head components`, () => {
        const setHeadComponents = jest.fn()

        onRenderBody({ setHeadComponents }, {})

        expect(setHeadComponents).not.toHaveBeenCalled()
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

      it(`sets the correct head components`, () => {
        const setHeadComponents = jest.fn()
        const pluginOptions = { fs_org: `test-org` }

        onRenderBody({ setHeadComponents }, pluginOptions)

        expect(setHeadComponents.mock.calls).toMatchSnapshot()
      })
    })
  })
})
