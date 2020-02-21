jest.mock(`graphql-tools-fork`, () => {
  return {
    transformSchema: jest.fn(),
    introspectSchema: jest.fn(),
    RenameTypes: jest.fn(),
  }
})
jest.mock(`apollo-link-http`, () => {
  return {
    createHttpLink: jest.fn(),
  }
})
const { createHttpLink } = require(`apollo-link-http`)
jest.mock(`gatsby/graphql`, () => {
  const graphql = jest.requireActual(`gatsby/graphql`)
  return {
    ...graphql,
    buildSchema: jest.fn(),
    printSchema: jest.fn(),
  }
})
const { sourceNodes, createPages } = require(`../gatsby-node`)
const nodeFetch = require(`node-fetch`)
const mockResponse = {
  data: {
    allBuilderModels: {
      page: [],
    },
  },
}
const getInternalGatsbyAPI = () => {
  const actions = {
    addThirdPartySchema: jest.fn(),
    createNode: jest.fn(),
    createPage: jest.fn(),
  }

  return {
    actions,
    cache: {
      get: jest.fn(),
      set: jest.fn(),
    },
    createContentDigest: jest.fn(),
    createNodeId: jest.fn(),
    graphql: jest.fn(() => Promise.resolve(mockResponse)),
  }
}

describe(`validation`, () => {
  it(`throws on missing public API Key`, () => {
    expect(
      sourceNodes(getInternalGatsbyAPI(), { templates: {} })
    ).rejects.toThrowErrorMatchingSnapshot()
  })

  it(`throws on an invalid templates path`, () => {
    expect(
      createPages(getInternalGatsbyAPI(), {
        templates: { page: `Invalid` },
        publicAPIKey: `mock___`,
      })
    ).rejects.toThrowErrorMatchingSnapshot()
  })
})

describe(`createSchemaNode`, () => {
  it(`invokes createContentDigest`, async () => {
    const api = getInternalGatsbyAPI()
    await sourceNodes(api, {
      publicAPIKey: `mock___`,
    })
    expect(api.createContentDigest).toHaveBeenCalledTimes(1)
  })
})

describe(`createHttpLink`, () => {
  it(`use node fetch`, async () => {
    const api = getInternalGatsbyAPI()
    await sourceNodes(api, {
      publicAPIKey: `mock__`,
    })

    expect(createHttpLink).toHaveBeenCalledWith(
      expect.objectContaining({ fetch: nodeFetch })
    )
  })
})
