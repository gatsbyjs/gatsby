import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [
      `"maxWidth" must be a number`,
      `"linkImagesToOriginal" must be a boolean`,
      `"showCaptions" must be a boolean`,
      `"markdownCaptions" must be a boolean`,
      `"sizeByPixelDensity" must be a boolean`,
      `"wrapperStyle" must be one of [object]`,
      `"backgroundColor" must be a string`,
      `"quality" must be a number`,
      `"withWebp" must be a boolean`,
      `"tracedSVG" must be a boolean`,
      `"loading" must be one of [lazy, eager, auto]`,
      `"disableBgImageOnAlpha" must be a boolean`,
      `"disableBgImage" must be a boolean`,
      `"srcSetBreakpoints" must be an array`,
    ]

    const { errors } = await testPluginOptionsSchema(pluginOptionsSchema, {
      maxWidth: `This should be a number`,
      linkImagesToOriginal: `This should be a boolean`,
      showCaptions: `This should be a boolean`,
      markdownCaptions: `This should be a boolean`,
      sizeByPixelDensity: `This should be a boolean`,
      wrapperStyle: `This should be an object`,
      backgroundColor: 123,
      quality: `This should be a number`,
      withWebp: `This should be a boolean`,
      tracedSVG: `This should be a boolean`,
      loading: `This should be lazy, eager or auto`,
      disableBgImageOnAlpha: `This should be a boolean`,
      disableBgImage: `This should be a boolean`,
      srcSetBreakpoints: `This should be an array`,
    })

    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, async () => {
    const { isValid } = await testPluginOptionsSchema(pluginOptionsSchema, {
      maxWidth: 700,
      linkImagesToOriginal: false,
      showCaptions: true,
      markdownCaptions: true,
      sizeByPixelDensity: true,
      wrapperStyle: { marginTop: `1rem`, padding: `1.5rem`, color: `blue` },
      backgroundColor: `red`,
      quality: 77,
      withWebp: true,
      tracedSVG: true,
      loading: `eager`,
      disableBgImageOnAlpha: true,
      disableBgImage: true,
      srcSetBreakpoints: [400, 600, 800],
    })

    expect(isValid).toBe(true)
  })
})
