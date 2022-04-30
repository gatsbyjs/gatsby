import { onCreateBabelConfig } from "../gatsby-node"
import * as path from "path"

describe(`gatsby-plugin-emotion`, () => {
  describe(`onCreateBabelConfig`, () => {
    it(`sets the correct babel preset`, () => {
      const actions = { setBabelPreset: jest.fn() }
      const store = {
        getState: () => {
          return { config: {} }
        },
      }

      onCreateBabelConfig({ actions, store }, null)

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

    it(`sets the correct babel plugin when using automatic jsxRuntime`, () => {
      const actions = { setBabelPlugin: jest.fn() }
      const store = {
        getState: () => {
          return { config: { jsxRuntime: `automatic` } }
        },
      }

      onCreateBabelConfig({ actions, store }, null)

      expect(actions.setBabelPlugin).toHaveBeenCalledTimes(1)
      expect(actions.setBabelPlugin).toHaveBeenCalledWith({
        name: expect.stringContaining(path.join(`@emotion`, `babel-plugin`)),
        options: {
          sourceMap: true,
          autoLabel: `dev-only`,
        },
      })
    })

    it(`passes additional options to the preset`, () => {
      const actions = { setBabelPreset: jest.fn() }
      const pluginOptions = { useBuiltIns: true }
      const store = {
        getState: () => {
          return { config: {} }
        },
      }

      onCreateBabelConfig({ actions, store }, pluginOptions)

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

    it(`passes additional options to the plugin when using automatic jsxRuntime`, () => {
      const actions = { setBabelPlugin: jest.fn() }
      const pluginOptions = { useBuiltIns: true }
      const store = {
        getState: () => {
          return { config: { jsxRuntime: `automatic` } }
        },
      }

      onCreateBabelConfig({ actions, store }, pluginOptions)

      expect(actions.setBabelPlugin).toHaveBeenCalledTimes(1)
      expect(actions.setBabelPlugin).toHaveBeenCalledWith({
        name: expect.stringContaining(path.join(`@emotion`, `babel-plugin`)),
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
        const store = {
          getState: () => {
            return { config: {} }
          },
        }

        onCreateBabelConfig({ actions, store }, null)

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
