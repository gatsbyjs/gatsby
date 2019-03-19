const { splitPackageName } = require(`../splitPackageName`)

describe(`gatsby-remark-code-repls`, () => {
  describe(`splitPackageName`, () => {
    it(`splits name with undefined scope and undefined version`, () => {
      expect(splitPackageName(`libName`)).toEqual([`libName`, null])
    })

    it(`splits name with undefined scope and defined version`, () => {
      expect(splitPackageName(`libName@^1.2.3`)).toEqual([`libName`, `^1.2.3`])
    })

    it(`splits name with scope and undefined version`, () => {
      expect(splitPackageName(`@acme/libName`)).toEqual([`@acme/libName`, null])
    })

    it(`splits name with scope and version`, () => {
      expect(splitPackageName(`@acme/libName@^1.2.3`)).toEqual([
        `@acme/libName`,
        `^1.2.3`,
      ])
    })
  })
})
