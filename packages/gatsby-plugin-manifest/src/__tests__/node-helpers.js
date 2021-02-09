const path = require(`path`)
const { doesIconExist } = require(`../node-helpers`)

describe(`gatsby-plugin-manifest`, () => {
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
