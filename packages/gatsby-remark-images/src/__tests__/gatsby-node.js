import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

const warnSpy = jest.spyOn(console, `warn`).mockImplementation(() => {
  // silence warnings
})

beforeEach(() => {
  warnSpy.mockClear()
})

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [
      `"maxWidth" must be a number`,
      `"linkImagesToOriginal" must be a boolean`,
      `"showCaptions" must be one of [boolean, array]`,
      `"markdownCaptions" must be a boolean`,
      `"wrapperStyle" must be one of [object, string]`,
      `"backgroundColor" must be a string`,
      `"quality" must be a number`,
      `"withWebp" must be one of [object, boolean]`,
      `"withAvif" must be one of [object, boolean]`,
      `"tracedSVG" must be one of [boolean, object]`,
      `"loading" must be one of [lazy, eager, auto]`,
      `"decoding" must be one of [async, sync, auto]`,
      `"disableBgImageOnAlpha" must be a boolean`,
      `"disableBgImage" must be a boolean`,
      `"srcSetBreakpoints" must be an array`,
    ]

    const { errors, isValid } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        maxWidth: `This should be a number`,
        linkImagesToOriginal: `This should be a boolean`,
        showCaptions: `This should be a boolean`,
        markdownCaptions: `This should be a boolean`,
        wrapperStyle: true,
        backgroundColor: 123,
        quality: `This should be a number`,
        withWebp: `This should be a boolean or an object`,
        withAvif: `This should be a boolean or an object`,
        tracedSVG: `This should be a boolean`,
        loading: `This should be lazy, eager or auto`,
        decoding: `This should be async, sync or auto`,
        disableBgImageOnAlpha: `This should be a boolean`,
        disableBgImage: `This should be a boolean`,
        srcSetBreakpoints: `This should be an array`,
      }
    )

    expect(isValid).toBe(false)
    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        maxWidth: 700,
        linkImagesToOriginal: false,
        showCaptions: true,
        markdownCaptions: true,
        wrapperStyle: { marginTop: `1rem`, padding: `1.5rem`, color: `blue` },
        backgroundColor: `red`,
        quality: 77,
        withWebp: true,
        withAvif: true,
        tracedSVG: true,
        loading: `eager`,
        decoding: `async`,
        disableBgImageOnAlpha: true,
        disableBgImage: true,
        srcSetBreakpoints: [400, 600, 800],
      }
    )

    expect(isValid).toBe(true)

    expect(warnSpy).toBeCalledWith(
      `"tracedSVG" plugin option for "gatsby-remark-images" is no longer supported. Blurred placeholder will be used. See https://gatsby.dev/tracesvg-removal/`
    )
    expect(errors).toEqual([])
  })

  it(`should validate the withWebp prop`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        withWebp: { quality: 100 },
      }
    )

    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })

  it(`should validate the withAvif prop`, async () => {
    const { isValid } = await testPluginOptionsSchema(pluginOptionsSchema, {
      withAvif: { quality: 100 },
    })

    expect(isValid).toBe(true)
  })

  describe(`allow to use array of valid strings for "showCaptions"`, () => {
    it(`["title", "alt"]`, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        pluginOptionsSchema,
        {
          showCaptions: [`title`, `alt`],
        }
      )

      expect(isValid).toBe(true)
      expect(errors).toEqual([])
    })

    it(`["title"]`, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        pluginOptionsSchema,
        {
          showCaptions: [`title`],
        }
      )

      expect(isValid).toBe(true)
      expect(errors).toEqual([])
    })

    it(`["alt"]`, async () => {
      const { isValid, errors } = await testPluginOptionsSchema(
        pluginOptionsSchema,
        {
          showCaptions: [`alt`],
        }
      )

      expect(isValid).toBe(true)
      expect(errors).toEqual([])
    })

    it(`["not valid"] (should fail validation)`, async () => {
      const expectedErrors = [
        `"showCaptions[0]" does not match any of the allowed types`,
      ]

      const { isValid, errors } = await testPluginOptionsSchema(
        pluginOptionsSchema,
        {
          showCaptions: [`not valid`],
        }
      )

      expect(isValid).toBe(false)
      expect(errors).toEqual(expectedErrors)
    })
  })

  describe(`allow different variants of "tracedSVG" option`, () => {
    describe(`supports boolean variant`, () => {
      it.each([
        [`true`, true],
        [`false`, false],
      ])(`%s`, async (_title, booleanValue) => {
        const { isValid, errors } = await testPluginOptionsSchema(
          pluginOptionsSchema,
          {
            tracedSVG: booleanValue,
          }
        )

        expect(isValid).toBe(true)

        if (booleanValue) {
          expect(warnSpy).toBeCalledWith(
            `"tracedSVG" plugin option for "gatsby-remark-images" is no longer supported. Blurred placeholder will be used. See https://gatsby.dev/tracesvg-removal/`
          )
        }
        expect(errors).toEqual([])
      })
    })

    describe(`supports object notation`, () => {
      it(`should validate when all fields are set`, async () => {
        const { isValid, errors } = await testPluginOptionsSchema(
          pluginOptionsSchema,
          {
            tracedSVG: {
              turnPolicy: `TURNPOLICY_RIGHT`,
              turdSize: 50,
              alphaMax: 0.5,
              optCurve: false,
              optTolerance: 0.9,
              threshold: 230,
              blackOnWhite: false,
              color: `red`,
              background: `green`,
            },
          }
        )

        expect(isValid).toBe(true)

        expect(warnSpy).toBeCalledWith(
          `"tracedSVG" plugin option for "gatsby-remark-images" is no longer supported. Blurred placeholder will be used. See https://gatsby.dev/tracesvg-removal/`
        )
        expect(errors).toEqual([])
      })

      it(`should validate when some fields are set`, async () => {
        const { isValid, errors } = await testPluginOptionsSchema(
          pluginOptionsSchema,
          {
            tracedSVG: {
              turnPolicy: `TURNPOLICY_RIGHT`,
              turdSize: 50,
              // alphaMax: 0.5,
              // optCurve: 0.2,
              // optTolerance: 0.9,
              // threshold: 230,
              // blackOnWhite: false,
              color: `red`,
              background: `green`,
            },
          }
        )

        expect(isValid).toBe(true)

        expect(warnSpy).toBeCalledWith(
          `"tracedSVG" plugin option for "gatsby-remark-images" is no longer supported. Blurred placeholder will be used. See https://gatsby.dev/tracesvg-removal/`
        )
        expect(errors).toEqual([])
      })

      it(`should fail validation when unknown fields are set`, async () => {
        const expectedErrors = [`"tracedSVG.foo" is not allowed`]

        const { isValid, errors } = await testPluginOptionsSchema(
          pluginOptionsSchema,
          {
            tracedSVG: {
              foo: `bar`,
            },
          }
        )

        expect(isValid).toBe(false)
        expect(errors).toEqual(expectedErrors)
      })

      describe(`turnPolicy variants`, () => {
        it.each([
          `TURNPOLICY_BLACK`,
          `TURNPOLICY_WHITE`,
          `TURNPOLICY_LEFT`,
          `TURNPOLICY_RIGHT`,
          `TURNPOLICY_MINORITY`,
          `TURNPOLICY_MAJORITY`,
        ])(`supports setting by policy name (%s)`, async name => {
          const { isValid, errors } = await testPluginOptionsSchema(
            pluginOptionsSchema,
            {
              tracedSVG: { turnPolicy: name },
            }
          )

          expect(isValid).toBe(true)

          expect(warnSpy).toBeCalledWith(
            `"tracedSVG" plugin option for "gatsby-remark-images" is no longer supported. Blurred placeholder will be used. See https://gatsby.dev/tracesvg-removal/`
          )
          expect(errors).toEqual([])
        })

        it.each([
          `black`,
          `white`,
          `left`,
          `TURNPOLICY_RIGHT`,
          `minority`,
          `majority`,
        ])(`supports setting by policy value (%s)`, async value => {
          const { isValid, errors } = await testPluginOptionsSchema(
            pluginOptionsSchema,
            {
              tracedSVG: { turnPolicy: value },
            }
          )

          expect(isValid).toBe(true)

          expect(warnSpy).toBeCalledWith(
            `"tracedSVG" plugin option for "gatsby-remark-images" is no longer supported. Blurred placeholder will be used. See https://gatsby.dev/tracesvg-removal/`
          )
          expect(errors).toEqual([])
        })

        it(`Doesn't support arbitrary string values`, async () => {
          const expectedErrors = [
            `"tracedSVG.turnPolicy" must be one of [TURNPOLICY_BLACK, TURNPOLICY_WHITE, TURNPOLICY_LEFT, TURNPOLICY_RIGHT, TURNPOLICY_MINORITY, TURNPOLICY_MAJORITY, black, white, left, right, minority, majority]`,
          ]

          const { isValid, errors } = await testPluginOptionsSchema(
            pluginOptionsSchema,
            {
              tracedSVG: { turnPolicy: `foo` },
            }
          )

          expect(isValid).toBe(false)
          expect(errors).toEqual(expectedErrors)
        })
      })

      describe(`threshold`, () => {
        // valid settings
        it.each([
          [
            `THRESHOLD_AUTO`,
            {
              value: -1,
              expectedIsValid: true,
            },
          ],
          [
            0,
            {
              expectedIsValid: true,
            },
          ],
          [
            128,
            {
              expectedIsValid: true,
            },
          ],
          [
            255,
            {
              expectedIsValid: true,
            },
          ],
        ])(`Allow setting %s`, async (titleAndMaybeValue, { value }) => {
          if (typeof value === `undefined`) {
            // if value wasn't explicitly set use title
            value = titleAndMaybeValue
          }

          const { isValid, errors } = await testPluginOptionsSchema(
            pluginOptionsSchema,
            {
              tracedSVG: { threshold: value },
            }
          )

          expect(isValid).toBe(true)

          expect(warnSpy).toBeCalledWith(
            `"tracedSVG" plugin option for "gatsby-remark-images" is no longer supported. Blurred placeholder will be used. See https://gatsby.dev/tracesvg-removal/`
          )
          expect(errors).toEqual([])
        })

        // invalid settings
        it.each([
          [
            -5,
            {
              expectedIsValid: false,
              errorMessage: `"tracedSVG.threshold" must be greater than or equal to 0`,
            },
          ],
          [
            256,
            {
              expectedIsValid: false,
              errorMessage: `"tracedSVG.threshold" must be less than or equal to 255`,
            },
          ],
        ])(
          `Doesn't allow setting %s`,
          async (titleAndMaybeValue, { value, errorMessage }) => {
            if (typeof value === `undefined`) {
              // if value wasn't explicitly set use title
              value = titleAndMaybeValue
            }

            const { isValid, errors } = await testPluginOptionsSchema(
              pluginOptionsSchema,
              {
                tracedSVG: { threshold: value },
              }
            )

            expect(isValid).toBe(false)
            expect(errors[0]).toEqual(errorMessage)
          }
        )
      })
    })
  })
})
