import { isPriorityBuild } from "../src/helpers"

describe(`isPriorityBuild`, () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    jest.resetModules()
  })

  afterAll(() => {
    process.env = { ...OLD_ENV }
  })

  describe(`when prioritize is true and variables are unset`, () => {
    it(`returns true`, () => {
      const pluginOptions = { prioritize: true }

      process.env.CI = undefined
      process.env.GATSBY_CLOUD = undefined
      process.env.GATSBY_IS_PR_BUILD = undefined
      process.env.NETLIFY = undefined
      process.env.CONTEXT = undefined

      expect(isPriorityBuild(pluginOptions)).toEqual(true)
    })
  })

  describe(`when prioritize is false and variables are set`, () => {
    it(`returns false`, () => {
      const pluginOptions = { prioritize: false }

      process.env.CI = `true`
      process.env.GATSBY_CLOUD = `true`
      process.env.GATSBY_IS_PR_BUILD = `false`
      process.env.NETLIFY = `true`
      process.env.CONTEXT = `production`

      expect(isPriorityBuild(pluginOptions)).toEqual(false)
    })
  })

  describe(`when prioritize is unset and Gatsby Cloud variables are set`, () => {
    it(`returns true`, () => {
      const pluginOptions = {}

      process.env.CI = `true`
      process.env.GATSBY_CLOUD = `true`
      process.env.GATSBY_IS_PR_BUILD = `false`
      process.env.NETLIFY = undefined
      process.env.CONTEXT = undefined

      expect(isPriorityBuild(pluginOptions)).toEqual(true)
    })
  })

  describe(`when prioritize is unset and and Netlify variables are set`, () => {
    it(`returns true`, () => {
      const pluginOptions = {}

      process.env.CI = `true`
      process.env.GATSBY_CLOUD = undefined
      process.env.GATSBY_IS_PR_BUILD = undefined
      process.env.NETLIFY = `true`
      process.env.CONTEXT = `production`

      expect(isPriorityBuild(pluginOptions)).toEqual(true)
    })
  })

  describe(`when prioritize is unset and and variables are unset`, () => {
    it(`returns false`, () => {
      const pluginOptions = {}

      process.env.CI = undefined
      process.env.GATSBY_CLOUD = undefined
      process.env.GATSBY_IS_PR_BUILD = undefined
      process.env.NETLIFY = undefined
      process.env.CONTEXT = undefined

      expect(isPriorityBuild(pluginOptions)).toEqual(false)
    })
  })
})
