import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../../gatsby-node"

describe(`pluginOptionsSchema`, () => {
  it(`should reject incorrect options`, async () => {
    const options = {
      defaults: {
        formats: [`gif`, `webp`],
        placeholder: `base64`,
        quality: `great`,
        breakpoints: [`mobile`],
        backgroundColor: 0,
        tracedSVGOptions: null,
        transformOptions: false,
        blurredOptions: 1,
        jpgOptions: `none`,
        pngOptions: [{}],
        webpOptions: /a/,
        avifOptions: 1,
      },
    }
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )
    expect(isValid).toBe(false)
    expect(errors).toEqual([
      `"defaults.formats[0]" must be one of [auto, png, jpg, webp, avif]`,
      `"defaults.placeholder" must be one of [tracedSVG, dominantColor, blurred, none]`,
      `"defaults.quality" must be a number`,
      `"defaults.breakpoints[0]" must be a number`,
      `"defaults.backgroundColor" must be a string`,
      `"defaults.transformOptions" must be of type object`,
      `"defaults.tracedSVGOptions" must be of type object`,
      `"defaults.blurredOptions" must be of type object`,
      `"defaults.jpgOptions" must be of type object`,
      `"defaults.pngOptions" must be of type object`,
      `"defaults.avifOptions" must be of type object`,
    ])
  })

  it(`should accept correct options`, async () => {
    const options = {
      defaults: {
        formats: [`auto`, `webp`],
        placeholder: `dominantColor`,
        quality: 50,
        breakpoints: [100, 200],
        backgroundColor: `rebeccapurple`,
        tracedSVGOptions: {},
        blurredOptions: { quality: 20 },
        jpgOptions: { quality: 20 },
        pngOptions: { quality: 20 },
        webpOptions: { quality: 20 },
        avifOptions: { quality: 20 },
      },
    }
    const { isValid } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )
    expect(isValid).toBe(true)
  })
})
