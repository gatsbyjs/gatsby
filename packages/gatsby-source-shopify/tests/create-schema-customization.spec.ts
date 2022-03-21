import { createSchemaCustomization } from "../src/create-schema-customization"

import { mockGatsbyApi, mockPluginOptions } from "./mocks"

const connections = [`orders`, `collections`, `locations`]

const generateTestName = (downloadImages, shopifyConnections): string => {
  const modifiers = [
    downloadImages ? `with` : `without`,
    shopifyConnections ? `with` : `without`,
  ]

  return `Creates the correct definitions ${modifiers[0]} downloadImages and ${modifiers[1]} connections`
}

const gatsbyApi = mockGatsbyApi()
const pluginOptions = mockPluginOptions()

describe(`createSchemaCustomization`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  for (const downloadImages of [false, true]) {
    for (const shopifyConnections of [undefined, connections]) {
      it(generateTestName(downloadImages, shopifyConnections), () => {
        createSchemaCustomization(gatsbyApi, {
          ...pluginOptions,
          downloadImages,
          shopifyConnections,
          typePrefix: `__PREFIX__`,
        })

        expect(gatsbyApi.actions.createTypes.mock.calls).toMatchSnapshot()
      })
    }
  }
})
