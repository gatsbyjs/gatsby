jest.mock(`graphql-tools`, () => {
  return {
    makeRemoteExecutableSchema: jest.fn(),
    transformSchema: jest.fn(),
    introspectSchema: jest.fn(),
    RenameTypes: jest.fn(),
  }
})
jest.mock(`gatsby/graphql`, () => {
  const graphql = jest.requireActual(`gatsby/graphql`)
  return {
    ...graphql,
    buildSchema: jest.fn(),
    printSchema: jest.fn(),
  }
})
const { sourceNodes } = require(`../gatsby-node`)

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
