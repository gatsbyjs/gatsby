const Promise = require(`bluebird`)
const os = require(`os`)
const yaml = require(`js-yaml`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process YAML nodes correctly`, () => {
  const node = {
    id: `whatever`,
    parent: null,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/yaml`,
    },
    name: `test`,
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`correctly creates nodes from JSON which is an array of objects`, async () => {
    const data = [{ blue: true, funny: `yup` }, { blue: false, funny: `nope` }]
    node.content = yaml.safeDump(data)

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

    await onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId,
      createContentDigest,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2)
      expect(createParentChildLink).toHaveBeenCalledTimes(2)
    })
  })

  it(`correctly creates a node from JSON which is a single object`, async () => {
    const data = { blue: true, funny: `yup` }
    node.content = yaml.safeDump(data)
    node.dir = `${os.tmpdir()}/bar/`

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

    await onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId,
      createContentDigest,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })

  it(`correctly sets node type for array of objects`, () =>
    Promise.all(
      [
        {
          typeName: null,
          expectedNodeTypes: [`TestYaml`, `TestYaml`],
        },
        {
          typeName: `fixed`,
          expectedNodeTypes: [`fixed`, `fixed`],
        },
        {
          typeName: ({ node, object }) => object.funny,
          expectedNodeTypes: [`yup`, `nope`],
        },
      ].map(
        async ({ typeName, expectedNodeTypes: [expectedOne, expectedTwo] }) => {
          const data = [
            { id: `foo`, blue: true, funny: `yup` },
            { blue: false, funny: `nope` },
          ]

          node.content = yaml.safeDump(data)
          node.dir = `${os.tmpdir()}/bar/`

          const createNode = jest.fn()
          const createParentChildLink = jest.fn()
          const actions = { createNode, createParentChildLink }
          const createNodeId = jest.fn()
          createNodeId.mockReturnValue(`uuid-from-gatsby`)
          const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

          return onCreateNode(
            {
              node,
              loadNodeContent,
              actions,
              createNodeId,
              createContentDigest,
            },
            { typeName }
          ).then(() => {
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
        }
      )
    ))

  it(`correctly sets node type for single object`, () =>
    Promise.all(
      [
        {
          typeName: null,
          expectedNodeType: `TestdirYaml`,
        },
        {
          typeName: `fixed`,
          expectedNodeType: `fixed`,
        },
        {
          typeName: ({ node, object }) => object.funny,
          expectedNodeType: `yup`,
        },
      ].map(async ({ typeName, expectedNodeType }) => {
        const data = { id: `foo`, blue: true, funny: `yup` }

        node.content = yaml.safeDump(data)
        node.dir = `${os.tmpdir()}/testdir/`

        const createNode = jest.fn()
        const createParentChildLink = jest.fn()
        const actions = { createNode, createParentChildLink }
        const createNodeId = jest.fn()
        createNodeId.mockReturnValue(`uuid-from-gatsby`)
        const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

        return onCreateNode(
          {
            node,
            loadNodeContent,
            actions,
            createNodeId,
            createContentDigest,
          },
          { typeName }
        ).then(() => {
          expect(createNode).toBeCalledWith(
            expect.objectContaining({
              internal: expect.objectContaining({
                type: expectedNodeType,
              }),
            })
          )
        })
      })
    ))
})
