import { createSchemaCustomization } from "../src/create-schema-customization"

import { makeMockGatsbyApi } from "./mocks"

describe(`createSchemaCustomization`, () => {
  describe(`when downloadImages is false and no connections are provided`, () => {
    const gatsbyApi = makeMockGatsbyApi()

    const pluginOptions = {
      downloadImages: false,
      typePrefix: `__PREFIX__`,
    }

    createSchemaCustomization(gatsbyApi, pluginOptions)

    it(`Creates the correct type definitions`, () => {
      expect(gatsbyApi.actions.createTypes.mock.calls).toMatchSnapshot()
    })
  })

  describe(`when downloadImages is true and all connections are provided`, () => {
    const gatsbyApi = makeMockGatsbyApi()

    const pluginOptions = {
      downloadImages: true,
      shopifyConnections: [`orders`, `collections`, `locations`],
      typePrefix: `__PREFIX__`,
    }

    createSchemaCustomization(gatsbyApi, pluginOptions)

    it(`Creates the correct type definitions`, () => {
      expect(gatsbyApi.actions.createTypes.mock.calls).toMatchSnapshot()
    })
  })
})
