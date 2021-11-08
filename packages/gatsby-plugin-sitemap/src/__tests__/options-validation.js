import { pluginOptionsSchema } from "../options-validation"
import { testPluginOptionsSchema, Joi } from "gatsby-plugin-utils"

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [`"wrong" is not allowed`]

    const { errors } = await testPluginOptionsSchema(pluginOptionsSchema, {
      wrong: `test`,
    })

    expect(errors).toEqual(expectedErrors)
  })

  it(`should provide error for deprecated "exclude" option`, async () => {
    const expectedErrors = [
      `As of v4 the \`exclude\` option was renamed to \`excludes\``,
    ]

    const { errors } = await testPluginOptionsSchema(pluginOptionsSchema, {
      exclude: [`test`],
    })

    expect(errors).toEqual(expectedErrors)
  })

  it(`creates correct defaults`, async () => {
    const pluginOptions = await pluginOptionsSchema({ Joi }).validateAsync({})

    expect(pluginOptions).toMatchInlineSnapshot(`
      Object {
        "createLinkInHead": true,
        "entryLimit": 45000,
        "excludes": Array [],
        "filterPages": [Function],
        "output": "/sitemap",
        "query": "{ site { siteMetadata { siteUrl } } allSitePage { nodes { path } } }",
        "resolvePagePath": [Function],
        "resolvePages": [Function],
        "resolveSiteUrl": [Function],
        "serialize": [Function],
      }
    `)
  })

  it.each`
    options
    ${undefined}
    ${{}}
  `(`should validate the schema: $options`, async ({ options }) => {
    const { isValid } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )

    expect(isValid).toBe(true)
  })
})
