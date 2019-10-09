import { onPreBootstrap } from "../gatsby-node"

jest.mock(`guess-webpack`)

describe(`gatsby-plugin-guess-js`, () => {
  describe(`onPreBootstrap`, () => {
    it(`should delete jwt pluginOptions`, () => {
      const pluginOptions = {
        jwt: `mykeys`,
      }

      onPreBootstrap({}, pluginOptions)

      expect(pluginOptions).not.toHaveProperty(`jwt`)
    })
  })
})
