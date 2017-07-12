const { joinPath, withBasePath } = require(`../path`)

describe(`paths`, () => {
  describe(`joinPath`, () => {
    it(`joins paths like path.join on Unix-type platforms`, () => {
      const paths = [`/foo`, `bar`, `baz`]
      const expected = paths.join(`/`)
      const actual = joinPath(...paths)
      expect(actual).toBe(expected)
    })
  })

  describe(`withBasePath`, () => {
    it(`returns a function that behaves like joinPath, but always prepends a base path`, () => {
      const basePath = `/foo`
      const subPath = `bar`
      const withFooPath = withBasePath(basePath)
      const expected = `${basePath}/${subPath}`
      const actual = withFooPath(subPath)
      expect(actual).toBe(expected)
    })
  })
})
