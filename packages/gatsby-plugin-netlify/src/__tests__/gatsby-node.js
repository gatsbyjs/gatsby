import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

// options: {
//   headers: {}, // option to add more headers. `Link` headers are transformed by the below criteria
//   allPageHeaders: [], // option to add headers for all pages. `Link` headers are transformed by the below criteria
//   mergeSecurityHeaders: true, // boolean to turn off the default security headers
//   mergeLinkHeaders: true, // boolean to turn off the default gatsby js headers
//   mergeCachingHeaders: true, // boolean to turn off the default caching headers
//   transformHeaders: (headers, path) => headers, // optional transform for manipulating headers under each path (e.g.sorting), etc.
//   generateMatchPathRewrites: true, // boolean to turn off automatic creation of redirect rules for client only paths
// },

describe(`gatsby-node.js`, () => {
  it(`should provide meaningful errors when fields are invalid`, () => {
    const expectedErrors = [
      `"headers" must be of type object`,
      `"allPageHeaders" must be an array`,
      `"mergeSecurityHeaders" must be a boolean`,
      `"mergeLinkHeaders" must be a boolean`,
      `"mergeCachingHeaders" must be a boolean`,
      `"transformHeaders" must have an arity lesser or equal to 2`,
      `"generateMatchPathRewrites" must be a boolean`,
    ]

    const { errors } = testPluginOptionsSchema(pluginOptionsSchema, {
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

  it(`should validate the schema`, () => {
    const { isValid } = testPluginOptionsSchema(pluginOptionsSchema, {
      headers: {
        Authorization: [`Bearer: Some-Magic-Token`],
        otherHeader: [`some`, `great`, `headers`],
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
