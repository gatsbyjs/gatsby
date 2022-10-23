const { onCreateNode, shouldOnCreateNode } = require(`../gatsby-node`)

describe(`Process image nodes correctly`, () => {
  it(`correctly creates an ImageSharp node from a file image node`, async () => {
    const node = {
      extension: `png`,
      id: `whatever`,
      children: [],
      internal: {
        contentDigest: `whatever`,
        type: `File`,
      },
    }
    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    const shouldCreateNode = shouldOnCreateNode({ node })

    if (shouldCreateNode) {
      await onCreateNode({
        node,
        actions,
        createNodeId,
      })
    }

    expect(createNode.mock.calls).toMatchSnapshot()
    expect(createParentChildLink.mock.calls).toMatchSnapshot()
    expect(createNode).toHaveBeenCalledTimes(1)
    expect(createParentChildLink).toHaveBeenCalledTimes(1)
  })
  it(`doesn't create an ImageSharp node for a .gif file`, async () => {
    const node = {
      extension: `gif`,
      id: `whatever`,
      children: [],
      internal: {
        contentDigest: `whatever`,
        type: `File`,
      },
    }
    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    const shouldCreateNode = shouldOnCreateNode({ node })

    if (shouldCreateNode) {
      await onCreateNode({
        node,
        actions,
        createNodeId,
      })
    }

    expect(createNode).toHaveBeenCalledTimes(0)
    expect(createParentChildLink).toHaveBeenCalledTimes(0)
  })

  it(`doesn't create an ImageSharp node if parent is not a File`, async () => {
    const node = {
      extension: `png`,
      id: `whatever`,
      children: [],
      internal: {
        contentDigest: `whatever`,
        type: `NotAFile`,
      },
    }
    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    const shouldCreateNode = shouldOnCreateNode({ node })

    if (shouldCreateNode) {
      await onCreateNode({
        node,
        actions,
        createNodeId,
      })
    }

    expect(createNode).toHaveBeenCalledTimes(0)
    expect(createParentChildLink).toHaveBeenCalledTimes(0)
  })
})
