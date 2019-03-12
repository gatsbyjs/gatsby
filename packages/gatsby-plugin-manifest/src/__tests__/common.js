const path = require(`path`)
const {
  defaultIcons,
  doesIconExist,
  createContentDigest,
  addDigestToPath,
} = require(`../common`)

describe(`gatsby-plugin-manifest`, () => {
  describe(`defaultIcons`, () => {
    it(`includes all icon sizes`, () => {
      expect(defaultIcons).toMatchSnapshot()
    })
  })

  describe(`doesIconExist`, () => {
    it(`returns true if image exists on filesystem`, () => {
      const iconSrc = path.resolve(__dirname, `./images/gatsby-logo.png`)
      expect(doesIconExist(iconSrc)).toBeTruthy()
    })

    it(`returns false if image does not exist on filesystem`, () => {
      const iconSrc = path.resolve(__dirname, `./images/non-existent-logo.png`)
      expect(doesIconExist(iconSrc)).toBeFalsy()
    })
  })

  describe(`createContentDigest`, () => {
    it(`returns valid digest`, () => {
      const iconSrc = `thisIsSomethingToHash`
      expect(createContentDigest(iconSrc)).toBe(
        `24ac9308d3adace282339005aff676bd1576f061`
      )
    })
  })

  describe(`addDigestToPath`, () => {
    it(`returns unmodified path`, () => {
      expect(
        addDigestToPath(`icons/icon-48x48.png`, `thisismydigest`, `none`)
      ).toBe(`icons/icon-48x48.png`)
    })

    it(`returns query modified path`, () => {
      expect(
        addDigestToPath(`icons/icon-48x48.png`, `thisismydigest`, `query`)
      ).toBe(`icons/icon-48x48.png?v=thisismydigest`)
    })

    it(`returns fileName modified path`, () => {
      expect(
        addDigestToPath(`icons/icon-48x48.png`, `thisismydigest`, `name`)
      ).toBe(`icons/icon-48x48-thisismydigest.png`)
    })
  })
})
