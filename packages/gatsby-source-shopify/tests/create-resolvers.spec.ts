import { createResolvers } from "../src/create-resolvers"

import { makeMockGatsbyApi } from "./mocks"

const connections = [`orders`, `collections`, `locations`]

const generateTestName = (downloadImages, shopifyConnections): string => {
  const modifiers = [
    downloadImages ? `with` : `without`,
    shopifyConnections ? `with` : `without`,
  ]

  return `Sets the correct resolvers ${modifiers[0]} downloadImages and ${modifiers[1]} connections`
}

const gatsbyApi = makeMockGatsbyApi()

describe(`createResolvers`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  for (const downloadImages of [false, true]) {
    for (const shopifyConnections of [undefined, connections]) {
      it(generateTestName(downloadImages, shopifyConnections), () => {
        const pluginOptions = {
          downloadImages,
          shopifyConnections,
          typePrefix: `__PREFIX__`,
        }

        createResolvers(gatsbyApi, pluginOptions)

        const getExpectedValue = (): number => {
          if (!downloadImages && shopifyConnections) return 4
          if (downloadImages && !shopifyConnections) return 2
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
