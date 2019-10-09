const { resolve } = require(`../url`)

describe(`url`, () => {
  describe(`resolve`, () => {
    it(`resolves segments into valid url pathname`, () => {
      const paths = [`/`, ``, `./foo`, `bar`, `baz`]
      const actual = resolve(...paths)
      expect(actual).toBe(`/foo/bar/baz`)
    })
  })
})
