import { urlResolve } from "../url"

describe(`url`, () => {
  describe(`urlResolve`, () => {
    it(`resolves segments into valid url pathname`, () => {
      const paths = [`/`, ``, `./foo`, `bar`, `baz`]
      const actual = urlResolve(...paths)
      expect(actual).toBe(`/foo/bar/baz`)
    })
  })
})
