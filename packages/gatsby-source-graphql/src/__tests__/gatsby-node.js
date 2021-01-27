jest.mock(`@graphql-tools/wrap`, () => {
  return {
    wrapSchema: jest.fn(),
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
const { sourceNodes } = require(`../gatsby-node`)
const { fetchWrapper } = require(`../fetch`)

const getInternalGatsbyAPI = () => {
  const actions = {
    addThirdPartySchema: jest.fn(),
    createPageDependency: jest.fn(),
    createNode: jest.fn(),
  }

  return {
    actions,
    cache: {
      get: jest.fn(),
      set: jest.fn(),
    },
    createContentDigest: jest.fn(),
    createNodeId: jest.fn(),
  }
}

describe(`validation`, () => {
  ;[
    [
      `throws on missing typename`,
      { fieldName: `github`, url: `https://github.com` },
    ],
    [
      `throws on missing fieldName`,
      { typeName: `Github`, url: `https://github.com` },
    ],
    [`throws on missing url`, { typeName: `Github`, fieldName: `github` }],
  ].forEach(([testName, pluginOptions]) => {
    it(testName, () => {
      expect(
        sourceNodes(getInternalGatsbyAPI(), pluginOptions)
      ).rejects.toThrowErrorMatchingSnapshot()
    })
  })
})

describe(`createSchemaNode`, () => {
  it(`invokes createContentDigest`, async () => {
    const api = getInternalGatsbyAPI()
    await sourceNodes(api, {
      typeName: `Github`,
      fieldName: `github`,
      url: `https://github.com`,
    })

    expect(api.createContentDigest).toHaveBeenCalledWith(expect.any(String))
    expect(api.createContentDigest).toHaveBeenCalledTimes(1)
  })
})

describe(`createHttpLink`, () => {
  it(`use passed in fetch if provided`, async () => {
    const api = getInternalGatsbyAPI()
    const mockFetch = jest.fn()
    await sourceNodes(api, {
      typeName: `Github foo`,
      fieldName: `github`,
      url: `https://github.com`,
      fetch: mockFetch,
    })

    expect(createHttpLink).toHaveBeenCalledWith(
      expect.objectContaining({ fetch: mockFetch })
    )
  })
  it(`use default fetch if not provided`, async () => {
    const api = getInternalGatsbyAPI()
    await sourceNodes(api, {
      typeName: `Github foo`,
      fieldName: `github`,
      url: `https://github.com`,
    })

    expect(createHttpLink).toHaveBeenCalledWith(
      expect.objectContaining({ fetch: fetchWrapper })
    )
  })
})
