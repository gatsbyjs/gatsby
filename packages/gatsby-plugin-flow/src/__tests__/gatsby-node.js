import { onCreateBabelConfig } from "../gatsby-node"
import * as path from "path"

describe(`gatsby-plugin-flow`, () => {
  describe(`onCreateBabelConfig`, () => {
    it(`sets the correct babel preset`, () => {
      const actions = { setBabelPreset: jest.fn() }

      onCreateBabelConfig({ actions }, null)

      expect(actions.setBabelPreset).toHaveBeenCalledTimes(1)
      expect(actions.setBabelPreset).toHaveBeenCalledWith({
        name: expect.stringContaining(path.join(`@babel`, `preset-flow`)),
      })
    })
  })
})
