const { sourceNodes } = require(`../gatsby-node`)

describe(`gatsby-source-faker`, () => {
  const actions = {}
  let createNodeId
  let createContentDigest

  const pluginOptions = {
    schema: {
      name: [`firstName`, `lastName`],
    },
    count: 3, // how many fake objects you need
    type: `NameData`, // Name of the graphql query node
  }

  beforeEach(() => {
    actions.createNode = jest.fn()
    createNodeId = jest.fn(() => `id`)
    createContentDigest = jest.fn(() => `digest`)
    sourceNodes({ actions, createNodeId, createContentDigest }, pluginOptions)
  })

  it(`should create nodes based on faker generated values`, () => {
    expect(actions.createNode).toHaveBeenNthCalledWith(pluginOptions.count, {
      children: [],
      id: `id`,
      internal: {
        type: pluginOptions.type,
        contentDigest: `digest`,
      },
      parent: null,
      name: {
        firstName: expect.any(String),
        lastName: expect.any(String),
      },
    })
  })
})
