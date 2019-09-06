const Joi = require(`@hapi/joi`)

const {
  validatePluginOptions,
  formatOptionsError,
} = require(`../validate-plugin-options`)

const schema = Joi.object().keys({
  a: Joi.string().required(),
  b: Joi.string().required(),
  c: Joi.string().default(`c`),
})

describe(`validating plugin options`, () => {
  it(`returns value(s) if not an instance of Joi`, () => {
    const opts = { hello: `world` }

    expect(validatePluginOptions(opts)).resolves.toEqual(opts)
  })

  describe(`validation with Joi/helper with validate method`, () => {
    const defaultOpts = { a: `a`, b: `b` }
    it(`coerces values`, () => {
      expect(validatePluginOptions(schema, defaultOpts)).resolves.toEqual({
        ...defaultOpts,
        c: `c`,
      })
    })

    it(`does not bail on first error`, async () => {
      try {
        await validatePluginOptions(schema, {})
      } catch (e) {
        expect(e.details).toHaveLength(2)
      } finally {
        expect.hasAssertions()
      }
    })

    it(`does not bail on unknown keys`, () => {
      const extra = { d: `d` }
      expect(
        validatePluginOptions(schema, { ...defaultOpts, ...extra })
      ).resolves.toEqual(expect.objectContaining(extra))
    })
  })
})

describe(`formatting error`, () => {
  it(`includes id`, () => {
    expect(formatOptionsError(new Error(`pretend a real error`))).toEqual(
      expect.objectContaining({
        id: `11329`,
      })
    )
  })

  it(`includes errors in context`, async () => {
    const err = await schema.validate({}).catch(e => e)

    expect(formatOptionsError(err)).toEqual(
      expect.objectContaining({
        context: expect.objectContaining({
          errors: expect.any(Array),
        }),
      })
    )
  })

  it(`includes plugin/theme details in context`, () => {
    const plugin = { name: `gatsby-plugin-yolo` }
    expect(formatOptionsError({}, plugin)).toEqual(
      expect.objectContaining({
        context: expect.objectContaining(plugin),
      })
    )
  })
})
