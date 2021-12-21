/**
 * @jest-environment jsdom
 */

const { onRouteUpdate } = require(`../gatsby-browser`)

describe(`gatsby-plugin-twitter`, () => {
  describe(`onRouteUpdate`, () => {
    it(`injects the twitter script if it hasn't already been injected`, () => {
      const querySelector = jest.spyOn(document, `querySelector`)
      const createElement = jest.spyOn(document, `createElement`)
      const getElementsByTagName = jest.spyOn(document, `getElementsByTagName`)
      const element = {}
      querySelector.mockReturnValue(true)
      createElement.mockReturnValueOnce(element)
      getElementsByTagName.mockReturnValue([{ appendChild: jest.fn() }])
      global.twttr = { widgets: { load: jest.fn() } }
      onRouteUpdate()
      onRouteUpdate()
      expect(element).toMatchSnapshot()
      expect(createElement).toHaveBeenCalledTimes(1)
      expect(global.twttr.widgets.load).toHaveBeenCalledTimes(2)
    })
    it(`only injects the twitter script if there is an embedded tweet`, () => {
      const querySelector = jest.spyOn(document, `querySelector`)
      querySelector.mockReturnValue(null)
      global.twttr = { widgets: { load: jest.fn() } }
      onRouteUpdate()
      expect(global.twttr.widgets.load).not.toHaveBeenCalled()
    })
  })
})
