import { onPreInit, onPreBootstrap } from "../gatsby-node"
import { GuessPlugin } from "guess-webpack"

jest.mock(`guess-webpack`)

describe(`gatsby-plugin-guess-js`, () => {
  describe(`onPreInit`, () => {
    it(`should delete jwt pluginOptions`, () => {
      const pluginOptions = {
        jwt: `mykeys`,
      }

      onPreInit({}, pluginOptions)

      expect(pluginOptions).not.toHaveProperty(`jwt`)
    })
  })

  describe(`onPreBootstrap`, () => {
    it(`should still have a jwt token to be used in jwt`, () => {
      const pluginOptions = {
        jwt: `mykeys`,
        // period: {
        //   start: `2019-10-09`,
        //   end: `2019-10-10`,
        // },
        GAViewID: `1234`,
      }

      onPreInit({}, pluginOptions)
      onPreBootstrap({}, pluginOptions)

      expect(GuessPlugin).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          jwt: `mykeys`,
          GA: `1234`,
        })
      )
    })
  })
})
