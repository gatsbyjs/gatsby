import * as path from "path"

import { testPluginOptionsSchema } from "gatsby-plugin-utils"

import { onCreateBabelConfig, pluginOptionsSchema } from "../gatsby-node"

describe(`onCreateBabelConfig`, () => {
  it(`sets the correct babel preset`, () => {
    const actions = { setBabelPreset: jest.fn() }

    onCreateBabelConfig({ actions })

    expect(actions.setBabelPreset).toHaveBeenCalledTimes(1)
    expect(actions.setBabelPreset).toHaveBeenCalledWith({
      name: expect.stringContaining(path.join(`@babel`, `preset-flow`)),
    })
  })
})

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedWarnings = [`"optionA" is not allowed`]

    const { isValid, warnings, hasWarnings } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        optionA: `This option shouldn't exist`,
      }
    )

    expect(isValid).toBe(true)
    expect(hasWarnings).toBe(true)
    expect(warnings).toEqual(expectedWarnings)
  })

  it.each`
    options
    ${undefined}
    ${{}}
  `(`should validate the schema: $options`, async ({ options }) => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )

    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })
})
