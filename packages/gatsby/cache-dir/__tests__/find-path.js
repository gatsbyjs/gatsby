import { cleanPath, setMatchPaths, findMatchPath, findPath } from "../find-path"

describe(`find-path`, () => {
  describe(`cleanPath`, () => {
    beforeEach(() => {
      global.__BASE_PATH__ = ``
    })

    it(`should strip out ? & # from a pathname`, () => {
      expect(cleanPath(`/mypath#anchor?gatsby=cool`)).toBe(`/mypath`)
    })

    it(`should convert a /index.html to root dir`, () => {
      expect(cleanPath(`/index.html`)).toBe(`/`)
    })

    it(`strip out a basePrefix`, () => {
      global.__BASE_PATH__ = `/blog`
      expect(cleanPath(`/blog/mypath`)).toBe(`/mypath`)
    })
  })

  describe(`findMatchPath`, () => {
    beforeEach(() => {
      // reset matchPaths
      setMatchPaths([])
      global.__BASE_PATH__ = ``
    })

    it(`should find a path when matchPath found`, () => {
      setMatchPaths([
        {
          matchPath: `/app/*`,
          path: `/app`,
        },
      ])

      expect(findMatchPath(`/app/dynamic-page#anchor?gatsby=cool`)).toBe(`/app`)
    })

    it(`should return null when no matchPathFound`, () => {
      setMatchPaths([
        {
          matchPath: `/app/*`,
          path: `/app`,
        },
      ])

      expect(findMatchPath(`/notanapp/dynamic-page`)).toBeNull()
    })
  })

  describe(`findPath`, () => {
    beforeEach(() => {
      // reset matchPaths
      setMatchPaths([])
      global.__BASE_PATH__ = ``
    })

    it(`should use matchPath if found`, () => {
      setMatchPaths([
        {
          matchPath: `/app/*`,
          path: `/app`,
        },
      ])

      expect(findPath(`/app/dynamic-page#anchor?gatsby=cool`)).toBe(`/app`)
    })

    it(`should return the cleaned up path when no matchPathFound`, () => {
      setMatchPaths([
        {
          matchPath: `/app/*`,
          path: `/app`,
        },
      ])

      expect(findPath(`/notanapp/my-page#anchor?gatsby=cool`)).toBe(
        `/notanapp/my-page`
      )
    })

    it(`should only process a request once`, () => {
      jest.resetModules()
      jest.mock(`@reach/router/lib/utils`)
      const findPath = require(`../find-path`).findPath
      const setMatchPaths = require(`../find-path`).setMatchPaths
      const match = require(`@reach/router/lib/utils`).match

      setMatchPaths([
        {
          matchPath: `/app/*`,
          path: `/app`,
        },
      ])

      expect(findPath(`/notanapp/my-page#anchor?gatsby=cool`)).toBe(
        `/notanapp/my-page`
      )
      expect(findPath(`/notanapp/my-page#anchor?gatsby=cool`)).toBe(
        `/notanapp/my-page`
      )
      expect(findPath(`/notanapp/my-page`)).toBe(`/notanapp/my-page`)

      expect(match).toHaveBeenCalledTimes(1)
    })
  })
})
