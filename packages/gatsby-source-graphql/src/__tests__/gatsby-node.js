jest.mock(`@graphql-tools/wrap`, () => {
  return {
    wrapSchema: jest.fn(),
    introspectSchema: jest.fn(),
    RenameTypes: jest.fn(),
  }
})
jest.mock(`@apollo/client`, () => {
  return {
    createHttpLink: jest.fn(),
  }
})
jest.mock(`@graphql-tools/links`, () => {
  return {
    linkToExecutor: jest.fn(),
  }
})
const { createHttpLink } = require(`@apollo/client`)
const { testPluginOptionsSchema } = require(`gatsby-plugin-utils`)
jest.mock(`gatsby/graphql`, () => {
  const graphql = jest.requireActual(`gatsby/graphql`)
  return {
    ...graphql,
    buildSchema: jest.fn(),
    printSchema: jest.fn(),
  }
})
const {
  createSchemaCustomization,
  sourceNodes,
  pluginOptionsSchema,
} = require(`../gatsby-node`)
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
  it(`should validate minimal, valid config`, async () => {
    const { isValid } = await testPluginOptionsSchema(pluginOptionsSchema, {
      url: `https://github.com`,
      typeName: `GitHub`,
      fieldName: `github`,
    })

    expect(isValid).toEqual(true)
  })

  it(`should invalidate a config missing required vars`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {}
    )

    expect(isValid).toEqual(false)
    expect(errors).toMatchInlineSnapshot(`
      Array [
        "\\"typeName\\" is required",
        "\\"fieldName\\" is required",
        "\\"value\\" must contain at least one of [url, createLink]",
      ]
    `)
  })

  it(`should validate a fully custom config`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        url: `https://github.com`,
        typeName: `GitHub`,
        fieldName: `github`,
        headers: () => {
          return {
            Authorization: `Bearer abc`,
          }
        },
        fetch: () => {},
        fetchOptions: {},
        createLink: () => {},
        createSchema: () => {},
        batch: true,
        transformSchema: () => {},
      }
    )

    expect(errors).toEqual([])
    expect(isValid).toEqual(true)
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
    await createSchemaCustomization(api, {
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
    await createSchemaCustomization(api, {
      typeName: `Github foo`,
      fieldName: `github`,
      url: `https://github.com`,
    })

    expect(createHttpLink).toHaveBeenCalledWith(
      expect.objectContaining({ fetch: fetchWrapper })
    )
  })
})
