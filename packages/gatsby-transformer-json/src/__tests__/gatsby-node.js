const Promise = require(`bluebird`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process JSON nodes correctly`, () => {
  const node = {
    name: `nodeName`,
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `application/json`,
      name: `test`,
    },
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`correctly creates nodes from JSON which is an array of objects`, async () => {
    const data = [
      { id: `foo`, blue: true, funny: `yup` },
      { blue: false, funny: `nope` },
    ]
    node.content = JSON.stringify(data)

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    await onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2)
      expect(createParentChildLink).toHaveBeenCalledTimes(2)
    })
  })

  it(`correctly creates a node from JSON which is a single object`, async () => {
    const data = { id: `foo`, blue: true, funny: `yup` }
    node.content = JSON.stringify(data)
    node.dir = `/tmp/foo/`

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    await onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })

  it(`correctly sets node type for array of objects`, async () => {
    ;[
      {
        typeName: null,
        expectedNodeTypes: [`NodeNameJson`, `NodeNameJson`],
      },
      {
        typeName: `fixed`,
        expectedNodeTypes: [`fixed`, `fixed`],
      },
      {
        typeName: (({ node, object }) => object.funny),
        expectedNodeTypes: [`yup`, `nope`],
      },
    ].forEach(async ({ typeName, expectedNodeTypes: [expectedOne, expectedTwo] }) => {
      const data = [
        { id: `foo`, blue: true, funny: `yup` },
        { blue: false, funny: `nope` },
      ]
      node.content = JSON.stringify(data)

      const createNode = jest.fn()
      const createParentChildLink = jest.fn()
      const actions = { createNode, createParentChildLink }
      const createNodeId = jest.fn()
      createNodeId.mockReturnValue(`uuid-from-gatsby`)

      await onCreateNode({
        node,
        loadNodeContent,
        actions,
        createNodeId,
      }, {
        typeName,
      }).then(() => {
        expect(createNode).toBeCalledWith(
          expect.objectContaining({
            internal: expect.objectContaining({
              type: expectedOne,
            }),
          })
        )
        expect(createNode).toBeCalledWith(
          expect.objectContaining({
            internal: expect.objectContaining({
              type: expectedTwo,
            }),
          })
        )
      })
    })
  })

  it(`correctly sets node type for single object`, async () => {
    ;[
      {
        typeName: null,
        expectedNodeType: `FooJson`,
      },
      {
        typeName: `fixed`,
        expectedNodeType: `fixed`,
      },
      {
        typeName: (({ node, object }) => object.funny),
        expectedNodeType: `yup`,
      },
    ].forEach(async ({ typeName, expectedNodeType }) => {
      const data = { id: `foo`, blue: true, funny: `yup` }
      node.content = JSON.stringify(data)
      node.dir = `/tmp/foo/`

      const createNode = jest.fn()
      const createParentChildLink = jest.fn()
      const actions = { createNode, createParentChildLink }
      const createNodeId = jest.fn()
      createNodeId.mockReturnValue(`uuid-from-gatsby`)

      await onCreateNode({
        node,
        loadNodeContent,
        actions,
        createNodeId,
      }, {
        typeName,
      }).then(() => {
        expect(createNode).toBeCalledWith(
          expect.objectContaining({
            internal: expect.objectContaining({
              type: expectedNodeType,
            }),
          })
        )
      })
    })
  })
})
