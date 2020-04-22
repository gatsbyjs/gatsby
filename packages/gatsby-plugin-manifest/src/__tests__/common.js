const path = require(`path`)
const { defaultIcons, doesIconExist, addDigestToPath } = require(`../common`)

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
