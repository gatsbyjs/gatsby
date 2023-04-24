import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"

describe(`pluginOptionsSchema`, () => {
  it(`should invalidate incorrect options`, async () => {
    const options = {
      trackingIds: undefined, // Is required
      gtagConfig: `test`,
      pluginConfig: {
        head: `test`,
        respectDNT: `test`,
        exclude: `test`,
        origin: 1,
        delayOnRouteUpdate: `test`,
      },
    }
    const expectedErrors = [
      `"trackingIds" is required`,
      `"gtagConfig" must be of type object`,
      `"pluginConfig.head" must be a boolean`,
      `"pluginConfig.respectDNT" must be a boolean`,
      `"pluginConfig.exclude" must be an array`,
      `"pluginConfig.origin" must be a string`,
      `"pluginConfig.delayOnRouteUpdate" must be a number`,
    ]

    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )

    expect(isValid).toBe(false)
    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate correct options`, async () => {
    const options = {
      trackingIds: [`test`],
      gtagConfig: {
        anonymize_ip: true,
      },
      pluginConfig: {
        head: true,
        respectDNT: true,
        exclude: [`test`],
        origin: `test`,
        delayOnRouteUpdate: 1,
      },
    }
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      options
    )

    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })
})
