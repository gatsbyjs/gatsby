import { testPluginOptionsSchema } from "gatsby-plugin-utils"

import { pluginOptionsSchema } from "../gatsby-node"

it(`should provide meaningful errors when fields are invalid`, async () => {
  const expectedWarnings = [`"optionA" is not allowed`]

  const { warnings, isValid, hasWarnings } = await testPluginOptionsSchema(
    pluginOptionsSchema,
    {
      optionA: `This options shouldn't exist`,
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
