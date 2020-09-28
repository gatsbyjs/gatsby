import { validateOptionsSchema } from "../"

it(`validates a basic JSON schema`, async () => {
  const pluginName = `gatsby-plugin-test`
  const pluginSchema = {
    type: `object`,
    properties: {
      str: { type: `string` },
    },
  }

  expect(
    await validateOptionsSchema(pluginName, pluginSchema, {
      str: `is a string`,
    })
  ).toEqual(true)
  expect(
    await validateOptionsSchema(pluginName, pluginSchema, {
      str: 43,
    })
  ).toEqual(false)
})
