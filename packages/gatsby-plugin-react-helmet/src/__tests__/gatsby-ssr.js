import { onRenderBody } from "../gatsby-ssr"

jest.mock(`react-helmet`)

describe(`gatsby-plugin-react-helmet`, () => {
  describe(`onRenderBody`, () => {
    it(`sets head components`, () => {
      const setHeadComponents = jest.fn()
      onRenderBody({ setHeadComponents })
      expect(setHeadComponents.mock.calls).toMatchSnapshot()
    })

    it(`sets html attributes`, () => {
      const setHeadComponents = jest.fn()
      const setHtmlAttributes = jest.fn()
      onRenderBody({ setHeadComponents, setHtmlAttributes })
      expect(setHtmlAttributes.mock.calls).toMatchSnapshot()
    })

    it(`sets body attributes`, () => {
      const setHeadComponents = jest.fn()
      const setBodyAttributes = jest.fn()
      onRenderBody({ setHeadComponents, setBodyAttributes })
      expect(setBodyAttributes.mock.calls).toMatchSnapshot()
    })
  })
})
