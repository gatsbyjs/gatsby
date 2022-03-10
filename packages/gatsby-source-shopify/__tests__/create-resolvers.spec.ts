import { createResolvers } from "../src/create-resolvers"

import { makeMockGatsbyApi } from "./mocks"

describe(`createResolvers`, () => {
  describe(`when downloadImages is false and no connections are provided`, () => {
    const gatsbyApi = makeMockGatsbyApi()

    const pluginOptions = {
      downloadImages: false,
      typePrefix: `__PREFIX__`,
    }

    createResolvers(gatsbyApi, pluginOptions)

    it(`Sets the correct resolvers`, () => {
      expect(gatsbyApi.createResolvers.mock.calls.length).toBe(3)
      expect(gatsbyApi.createResolvers.mock.calls).toMatchSnapshot()
    })
  })

  describe(`when downloadImages is true and all connections are provided`, () => {
    const gatsbyApi = makeMockGatsbyApi()

    const pluginOptions = {
      downloadImages: true,
      shopifyConnections: [`orders`, `collections`, `locations`],
      typePrefix: `__PREFIX__`,
    }

    createResolvers(gatsbyApi, pluginOptions)

    it(`Sets the correct resolvers`, () => {
      expect(gatsbyApi.createResolvers.mock.calls.length).toBe(3)
      expect(gatsbyApi.createResolvers.mock.calls).toMatchSnapshot()
    })
  })
})
