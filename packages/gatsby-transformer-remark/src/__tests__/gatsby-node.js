import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

describe(`gatsby-node.js`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [
      `"commonmark" must be a boolean`,
      `"footnotes" must be a boolean`,
      `"pedantic" must be a boolean`,
      `"gfm" must be a boolean`,
      `"plugins" must be an array`,
    ]

    const { errors } = await testPluginOptionsSchema(pluginOptionsSchema, {
      commonmark: `this should be a boolean`,
      footnotes: `this should be a boolean`,
      pedantic: `this should be a boolean`,
      gfm: `this should be a boolean`,
      plugins: `this should be an array`,
    })

    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, async () => {
    const { isValid } = await testPluginOptionsSchema(pluginOptionsSchema, {
      commonmark: false,
      footnotes: false,
      pedantic: false,
      gfm: false,
      plugins: [
        `gatsby-remark-copy-linked-files`,
        {
          resolve: `gatsby-remark-images`,
          options: {
            maxWidth: 756,
          },
        },
      ],
    })

    expect(isValid).toBe(true)
  })
})
