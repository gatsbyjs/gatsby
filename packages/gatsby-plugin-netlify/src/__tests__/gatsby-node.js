import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

describe(`gatsby-node.js`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [
      `"headers" must be of type object`,
      `"allPageHeaders" must be an array`,
      `"mergeSecurityHeaders" must be a boolean`,
      `"mergeLinkHeaders" must be a boolean`,
      `"mergeCachingHeaders" must be a boolean`,
      `"transformHeaders" must have an arity lesser or equal to 2`,
      `"generateMatchPathRewrites" must be a boolean`,
    ]

    const { errors } = await testPluginOptionsSchema(pluginOptionsSchema, {
      headers: `this should be an object`,
      allPageHeaders: `this should be an array`,
      mergeSecurityHeaders: `this should be a boolean`,
      mergeLinkHeaders: `this should be a boolean`,
      mergeCachingHeaders: `this should be a boolean`,
      transformHeaders: (too, many, args) => ``,
      generateMatchPathRewrites: `this should be a boolean`,
    })

    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, async () => {
    const { isValid } = await testPluginOptionsSchema(pluginOptionsSchema, {
      headers: {
        "/some-page": [`Bearer: Some-Magic-Token`],
        "/some-other-page": [`some`, `great`, `headers`],
      },
      allPageHeaders: [`First header`, `Second header`],
      mergeSecurityHeaders: true,
      mergeLinkHeaders: false,
      mergeCachingHeaders: true,
      transformHeaders: () => null,
      generateMatchPathRewrites: false,
    })

    expect(isValid).toBe(true)
  })
})
