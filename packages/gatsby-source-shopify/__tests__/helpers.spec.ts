import { isPriorityBuild } from "../src/helpers"

import { makeMockEnvironment } from "./mocks"

describe(`isPriorityBuild`, () => {
  const mockEnvironment = makeMockEnvironment();

  describe(`when prioritize is true and variables are unset`, () => {
    it(`returns true`, () => {
      const pluginOptions = { prioritize: true }
      mockEnvironment("none")

      expect(isPriorityBuild(pluginOptions)).toEqual(true)
    })
  })

  describe(`when prioritize is false and variables are set`, () => {
    it(`returns false`, () => {
      const pluginOptions = { prioritize: false }
      mockEnvironment("all")

      expect(isPriorityBuild(pluginOptions)).toEqual(false)
    })
  })

  describe(`when prioritize is unset and Gatsby Cloud variables are set`, () => {
    it(`returns true`, () => {
      const pluginOptions = {}
      mockEnvironment("gatsby")

      expect(isPriorityBuild(pluginOptions)).toEqual(true)
    })
  })

  describe(`when prioritize is unset and and Netlify variables are set`, () => {
    it(`returns true`, () => {
      const pluginOptions = {}
      mockEnvironment("netlify")

      expect(isPriorityBuild(pluginOptions)).toEqual(true)
    })
  })

  describe(`when prioritize is unset and and variables are unset`, () => {
    it(`returns false`, () => {
      const pluginOptions = {}
      mockEnvironment("none")

      expect(isPriorityBuild(pluginOptions)).toEqual(false)
    })
  })
})
