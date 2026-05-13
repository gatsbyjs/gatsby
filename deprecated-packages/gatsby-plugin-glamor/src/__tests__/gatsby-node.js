import { testPluginOptionsSchema } from "gatsby-plugin-utils"

import { pluginOptionsSchema } from "../gatsby-node"

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [`"optional" is not allowed`]

    const { errors } = await testPluginOptionsSchema(pluginOptionsSchema, {
      optional: `This options shouldn't exist`,
    })

    expect(errors).toEqual(expectedErrors)
  })

  it.each`
    options
    ${undefined}
    ${{}}
  `(`should validate the schema: $options`, async ({ options }) => {
    const { isValid } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )

    expect(isValid).toBe(true)
  })
})
