const path = require(`path`)
const { defaultIcons, doesIconExist } = require(`../common`)

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
})
