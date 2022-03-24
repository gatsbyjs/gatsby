import { createResolvers } from "../src/create-resolvers"
import { mockGatsbyApi, mockPluginOptions } from "./fixtures"

const connections = [`orders`, `collections`, `locations`]

const generateTestName = (downloadImages, shopifyConnections): string => {
  const modifiers = [
    downloadImages ? `with` : `without`,
    shopifyConnections.length > 0 ? `with` : `without`,
  ]

  return `Sets the correct resolvers ${modifiers[0]} downloadImages and ${modifiers[1]} connections`
}

const gatsbyApi = mockGatsbyApi()
const pluginOptions = mockPluginOptions()

describe(`createResolvers`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  for (const downloadImages of [false, true]) {
    for (const shopifyConnections of [[], connections]) {
      it(generateTestName(downloadImages, shopifyConnections), () => {
        createResolvers(gatsbyApi, {
          ...pluginOptions,
          downloadImages,
          shopifyConnections,
          typePrefix: `__PREFIX__`,
        })

        const getExpectedValue = (): number => {
          if (!downloadImages && shopifyConnections.length === 3) return 4
          if (downloadImages && shopifyConnections.length === 0) return 2
          return 3
        }

        expect(gatsbyApi.createResolvers.mock.calls.length).toEqual(
          getExpectedValue()
        )
        expect(gatsbyApi.createResolvers.mock.calls).toMatchSnapshot()
      })
    }
  }
})
