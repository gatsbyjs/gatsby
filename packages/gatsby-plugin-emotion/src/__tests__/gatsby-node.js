import { onCreateBabelConfig } from "../gatsby-node"
import * as path from "path"

describe(`gatsby-plugin-emotion`, () => {
  describe(`onCreateBabelConfig`, () => {
    it(`sets the correct babel preset`, () => {
      const actions = { setBabelPreset: jest.fn() }

      onCreateBabelConfig({ actions }, null)

      expect(actions.setBabelPreset).toHaveBeenCalledTimes(1)
      expect(actions.setBabelPreset).toHaveBeenCalledWith({
        name: expect.stringContaining(
          path.join(`@emotion`, `babel-preset-css-prop`)
        ),
        options: {
          sourceMap: true,
          autoLabel: `dev-only`,
        },
      })
    })

    it(`passes additional options on to the preset`, () => {
      const actions = { setBabelPreset: jest.fn() }
      const pluginOptions = { useBuiltIns: true }

      onCreateBabelConfig({ actions }, pluginOptions)

      expect(actions.setBabelPreset).toHaveBeenCalledTimes(1)
      expect(actions.setBabelPreset).toHaveBeenCalledWith({
        name: expect.stringContaining(
          path.join(`@emotion`, `babel-preset-css-prop`)
        ),
        options: {
          sourceMap: true,
          autoLabel: `dev-only`,
          useBuiltIns: true,
        },
      })
    })

    describe(`in production mode`, () => {
      let env

      beforeAll(() => {
        env = process.env.NODE_ENV
        process.env.NODE_ENV = `production`
      })

      afterAll(() => {
        process.env.NODE_ENV = env
      })

      it(`sets the correct babel preset`, () => {
        const actions = { setBabelPreset: jest.fn() }

        onCreateBabelConfig({ actions }, null)

        expect(actions.setBabelPreset).toHaveBeenCalledTimes(1)
        expect(actions.setBabelPreset).toHaveBeenCalledWith({
          name: expect.stringContaining(
            path.join(`@emotion`, `babel-preset-css-prop`)
          ),
          options: {
            sourceMap: false,
            autoLabel: `dev-only`,
          },
        })
      })
    })
  })
})
