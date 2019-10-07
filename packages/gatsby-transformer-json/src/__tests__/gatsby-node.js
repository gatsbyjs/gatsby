const Promise = require(`bluebird`)
const os = require(`os`)

const { onCreateNode } = require(`../gatsby-node`)

// Make some fake functions its expecting.
const loadNodeContent = node => Promise.resolve(node.content)

const bootstrapTest = async (node, pluginOptions = {}) => {
  const createNode = jest.fn()
  const createParentChildLink = jest.fn()
  const actions = { createNode, createParentChildLink }
  const createNodeId = jest.fn()
  createNodeId.mockReturnValue(`uuid-from-gatsby`)
  const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

  return await onCreateNode(
    {
      node,
      loadNodeContent,
      actions,
      createNodeId,
      createContentDigest,
    },
    pluginOptions
  ).then(() => {
    return {
      createNode,
      createParentChildLink,
    }
  })
}

describe(`Process JSON nodes correctly`, () => {
  const baseNode = {
    id: `whatever`,
    parent: null,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `application/json`,
    },
  }

  const baseFileNode = {
    ...baseNode,
    name: `nodeName`,
    dir: `${os.tmpdir()}/foo/`,
    internal: {
      ...baseNode.internal,
      type: `File`,
    },
  }

  const baseNonFileNode = {
    ...baseNode,
    internal: {
      ...baseNode.internal,
      type: `NotFile`,
    },
  }

  it(`correctly creates nodes from JSON which is an array of objects`, async () => {
    const data = [
      { id: `foo`, blue: true, funny: `yup` },
      { blue: false, funny: `nope` },
    ]
    const node = {
      ...baseFileNode,
      content: JSON.stringify(data),
    }

    return bootstrapTest(node).then(({ createNode, createParentChildLink }) => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2)
      expect(createParentChildLink).toHaveBeenCalledTimes(2)
    })
  })

  it(`correctly creates a node from JSON which is a single object`, async () => {
    const data = { id: `foo`, blue: true, funny: `yup` }
    const node = {
      ...baseFileNode,
      content: JSON.stringify(data),
    }

    return bootstrapTest(node).then(({ createNode, createParentChildLink }) => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })

  it(`coerces an id field to always be a String`, async () => {
    const data = { id: 12345, blue: true, funny: `yup` }
    const node = {
      ...baseFileNode,
      content: JSON.stringify(data),
    }

    return bootstrapTest(node).then(({ createNode, createParentChildLink }) => {
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
        typeName: ({ node, object }) => object.funny,
        expectedNodeTypes: [`yup`, `nope`],
      },
    ].forEach(
      async ({ typeName, expectedNodeTypes: [expectedOne, expectedTwo] }) => {
        const data = [
          { id: `foo`, blue: true, funny: `yup` },
          { blue: false, funny: `nope` },
        ]

        const node = {
          ...baseFileNode,
          content: JSON.stringify(data),
        }

        return bootstrapTest(node, { typeName }).then(
          ({ createNode, createParentChildLink }) => {
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
          }
        )
      }
    )
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
        typeName: ({ node, object }) => object.funny,
        expectedNodeType: `yup`,
      },
    ].forEach(async ({ typeName, expectedNodeType }) => {
      const data = { id: `foo`, blue: true, funny: `yup` }

      const node = {
        ...baseFileNode,
        content: JSON.stringify(data),
      }

      return bootstrapTest(node, { typeName }).then(
        ({ createNode, createParentChildLink }) => {
          expect(createNode).toBeCalledWith(
            expect.objectContaining({
              internal: expect.objectContaining({
                type: expectedNodeType,
              }),
            })
          )
        }
      )
    })
  })

  it(`correctly creates nodes from JSON which is an array of objects and doesn't come from fs`, async () => {
    const data = [
      { id: `foo`, blue: true, funny: `yup` },
      { blue: false, funny: `nope` },
    ]
    const node = {
      ...baseNonFileNode,
      content: JSON.stringify(data),
    }

    return bootstrapTest(node).then(({ createNode, createParentChildLink }) => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2)
      expect(createParentChildLink).toHaveBeenCalledTimes(2)
    })
  })

  it(`correctly creates a node from JSON which is a single object and doesn't come from fs`, async () => {
    const data = { id: `foo`, blue: true, funny: `yup` }
    const node = {
      ...baseNonFileNode,
      content: JSON.stringify(data),
    }

    return bootstrapTest(node).then(({ createNode, createParentChildLink }) => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })
})
