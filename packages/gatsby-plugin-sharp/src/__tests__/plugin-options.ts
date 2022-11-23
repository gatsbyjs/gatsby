import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../../gatsby-node"
import { doMergeDefaults, PluginOptionsDefaults } from "../plugin-options"

const defaults: PluginOptionsDefaults = {
  formats: [`auto`, `webp`],
  placeholder: `dominantColor`,
  quality: 50,
  breakpoints: [100, 200],
  backgroundColor: `rebeccapurple`,
  tracedSVGOptions: {},
  blurredOptions: { width: 20 },
  jpgOptions: { quality: 20 },
  pngOptions: { quality: 20 },
  webpOptions: { quality: 20 },
  avifOptions: { quality: 20 },
}

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
    const expectedErrors = [
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
    ]

    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )

    expect(isValid).toBe(false)
    expect(errors).toEqual(expectedErrors)
  })

  it(`should accept correct options`, async () => {
    const options = { defaults }
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )
    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })
})

describe(`plugin defaults`, () => {
  it(`uses defaults`, () => {
    const output = doMergeDefaults({}, defaults)
    expect(output).toMatchInlineSnapshot(`
      Object {
        "avifOptions": Object {
          "quality": 20,
        },
        "backgroundColor": "rebeccapurple",
        "blurredOptions": Object {
          "width": 20,
        },
        "breakpoints": Array [
          100,
          200,
        ],
        "formats": Array [
          "auto",
          "webp",
        ],
        "jpgOptions": Object {
          "quality": 20,
        },
        "placeholder": "dominantColor",
        "pngOptions": Object {
          "quality": 20,
        },
        "quality": 50,
        "tracedSVGOptions": Object {},
        "webpOptions": Object {
          "quality": 20,
        },
      }
    `)
  })

  it(`allows overrides`, () => {
    const output = doMergeDefaults({ backgroundColor: `papayawhip` }, defaults)
    expect(output.backgroundColor).toEqual(`papayawhip`)
    expect(output.quality).toEqual(50)
  })

  it(`allows overrides of arrays`, () => {
    const output = doMergeDefaults({ formats: [`auto`, `avif`] }, defaults)
    expect(output.formats).toEqual([`auto`, `avif`])
    expect(output.breakpoints).toEqual([100, 200])
  })

  it(`allows override of deep objects`, () => {
    const output = doMergeDefaults({ avifOptions: { quality: 50 } }, defaults)
    expect(output.avifOptions).toEqual({ quality: 50 })
  })

  it(`allows extra keys in objects`, () => {
    const output = doMergeDefaults({ avifOptions: { speed: 50 } }, defaults)
    expect(output.avifOptions).toEqual({ quality: 20, speed: 50 })
  })
})
