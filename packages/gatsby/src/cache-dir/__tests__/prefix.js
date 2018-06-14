const stripPrefix = require(`../prefix`).stripPrefix

const getWithPrefix = (pathPrefix = ``) => {
  Object.assign(global.window, {
    __PATH_PREFIX__: pathPrefix,
  })
  return require(`../prefix`).withPrefix
}

describe(`prefix`, () => {
  describe(`strip-prefix`, () => {
    it(`strips a prefix`, () => {
      expect(stripPrefix(`/foo/bar/`, `/foo`)).toBe(`/bar/`)
    })

    it(`strips first instance only`, () => {
      expect(stripPrefix(`/foo/foo/bar/`, `/foo`)).toBe(`/foo/bar/`)
    })

    it(`ignores prefix appearing elsewhere in the string`, () => {
      expect(stripPrefix(`/foo/bar/`, `bar`)).toBe(`/foo/bar/`)
    })

    it(`ignores a non-existent prefix`, () => {
      expect(stripPrefix(`/bar`, `/foo`)).toBe(`/bar`)
    })

    it(`returns input str if no prefix is provided`, () => {
      expect(stripPrefix(`/bar`)).toBe(`/bar`)
    })
  })

  describe(`withPrefix`, () => {
    describe(`works with default prefix`, () => {
      it(`default prefix does not return "//"`, () => {
        const to = `/`
        const root = getWithPrefix()(to)
        expect(root).toEqual(to)
      })

      it(`respects path prefix`, () => {
        const to = `/abc/`
        const pathPrefix = `/blog`
        const root = getWithPrefix(pathPrefix)(to)
        expect(root).toEqual(`${pathPrefix}${to}`)
      })
    })
  })
})
