import { onCreateBabelConfig } from "../gatsby-node"

describe(`gatsby-plugin-flow`, () => {
  describe(`onCreateBabelConfig`, () => {
    it(`sets the correct babel preset`, () => {
      const actions = { setBabelPreset: jest.fn() }

      onCreateBabelConfig({ actions }, null)

      expect(actions.setBabelPreset).toHaveBeenCalledTimes(1)
      expect(actions.setBabelPreset).toHaveBeenCalledWith({
        name: `@babel/preset-flow`,
      })
    })
  })
})
