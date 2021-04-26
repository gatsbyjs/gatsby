const { testPluginOptionsSchema } = require(`gatsby-plugin-utils`)
const { pluginOptionsSchema } = require(`../gatsby-node`)

describe(`pluginOptionsSchema`, () => {
  it(`should validate a valid config`, async () => {
    // Only the "toVerify" key of the schema will be verified in this test
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        offsetY: 100,
        icon: `<svg aria-hidden="true" height="20" version="1.1" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`,
        className: `custom-class`,
        maintainCase: true,
        removeAccents: true,
        isIconAfterHeader: true,
        elements: [`h1`, `h4`],
      }
    )

    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })

  it(`should validate a boolean icon`, async () => {
    // Only the "toVerify" key of the schema will be verified in this test
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        icon: false,
      }
    )

    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })

  it(`should invalidate an invalid config`, async () => {
    const expectedErrors = [
      `"offsetY" must be a number`,
      `"icon" must be one of [string, boolean]`,
      `"className" must be a string`,
      `"maintainCase" must be a boolean`,
      `"removeAccents" must be a boolean`,
      `"isIconAfterHeader" must be a boolean`,
      `"elements[0]" must be a string`,
      `"elements[1]" must be a string`,
    ]

    // Only the "toVerify" key of the schema will be verified in this test
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        offsetY: `string`,
        icon: 1000,
        className: true,
        maintainCase: `bla`,
        removeAccents: `yes`,
        isIconAfterHeader: `yes`,
        elements: [1, 2],
      }
    )

    expect(isValid).toBe(false)
    expect(errors).toEqual(expectedErrors)
  })
})
