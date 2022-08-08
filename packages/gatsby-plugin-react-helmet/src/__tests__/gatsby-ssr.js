import { Helmet } from "react-helmet"

jest.mock(`react-helmet`)

import { onRenderBody } from "../gatsby-ssr"

const getActions = (actions = {}) => {
  return {
    setHeadComponents: jest.fn(),
    ...actions,
  }
}

describe(`gatsby-plugin-react-helmet`, () => {
  describe(`onRenderBody`, () => {
    it(`sets head components`, () => {
      const actions = getActions()

      onRenderBody(actions)

      const titleComponent = Helmet.renderStatic().title.toComponent()

      expect(actions.setHeadComponents).toHaveBeenCalledTimes(1)

      expect(actions.setHeadComponents).toHaveBeenCalledWith([
        titleComponent,
        `link-component`,
        `meta-component`,
        `noscript-component`,
        `script-component`,
        `style-component`,
        `base-component`,
      ])
    })

    it(`sets html attributes`, () => {
      const actions = getActions({ setHtmlAttributes: jest.fn() })

      onRenderBody(actions)

      expect(actions.setHeadComponents).toHaveBeenCalledTimes(1)
      expect(actions.setHtmlAttributes).toHaveBeenCalledWith(
        `html-attributes-component`
      )
    })

    it(`sets body attributes`, () => {
      const actions = getActions({ setBodyAttributes: jest.fn() })

      onRenderBody(actions)

      expect(actions.setBodyAttributes).toHaveBeenCalledTimes(1)
      expect(actions.setBodyAttributes).toHaveBeenCalledWith(
        `body-attributes-component`
      )
    })
  })
})
