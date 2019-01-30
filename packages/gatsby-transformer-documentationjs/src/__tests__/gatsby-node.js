import groupBy from "lodash/groupBy"
import path from "path"
import gatsbyNode from "../gatsby-node"

describe(`transformer-react-doc-gen: onCreateNode`, () => {
  let actions, node, createdNodes, updatedNodes
  const createNodeId = jest.fn(id => id)
  const createContentDigest = jest.fn().mockReturnValue(`content-digest`)

  let run = (node = node, opts = {}) =>
    gatsbyNode.onCreateNode(
      {
        node,
        actions,
        createNodeId,
        createContentDigest,
      },
      opts
    )

  beforeEach(() => {
    createdNodes = []
    updatedNodes = []
    node = {
      id: `node_1`,
      children: [],
      absolutePath: path.join(__dirname, `fixtures`, `code.js`),
      internal: {
        mediaType: `application/javascript`,
        type: `File`,
      },
    }
    actions = {
      createNode: jest.fn(n => createdNodes.push(n)),
      createParentChildLink: jest.fn(n => updatedNodes.push(n)),
    }
  })

  describe(`Simple example`, () => {
    it(`creates doc json apple node`, async () => {
      await run(node)

      const appleNode = createdNodes.find(node => node.name === `apple`)
      expect(appleNode).toBeDefined()
    })

    it(`should extract out a description, params, and examples`, async () => {
      await run(node)

      const appleNode = createdNodes.find(node => node.name === `apple`)

      expect(appleNode.examples.length).toBe(1)
      expect(appleNode.examples[0]).toMatchSnapshot(`example`)

      const appleDescriptionNode = createdNodes.find(
        node => node.id === appleNode.description___NODE
      )

      expect(appleDescriptionNode).toBeDefined()
      expect(appleDescriptionNode.internal.content).toMatchSnapshot(
        `description content`
      )

      const paramNode = createdNodes.find(
        node => node.id === appleNode.params___NODE[0]
      )

      expect(paramNode).toBeDefined()
      expect(paramNode.name).toMatchSnapshot(`param name`)

      const paramDescriptionNode = createdNodes.find(
        node => node.id === paramNode.description___NODE
      )

      expect(paramDescriptionNode).toBeDefined()
      expect(paramDescriptionNode.internal.content).toMatchSnapshot(
        `param description`
      )
    })
  })

  describe.skip(`Complex example`, () => {
    // TO-DO add tests
  })

  describe(`Sanity checks`, () => {
    it(`should only process javascript File nodes`, async () => {
      await run({ internal: { mediaType: `text/x-foo` } })
      expect(createdNodes.length).toBe(0)

      await run({ internal: { mediaType: `application/javascript` } })
      expect(createdNodes.length).toBe(0)

      await run({
        id: `test`,
        children: [],
        absolutePath: path.join(__dirname, `fixtures`, `code.js`),
        internal: { mediaType: `application/javascript`, type: `File` },
      })
      expect(createdNodes.length).toBeGreaterThan(0)
    })

    it(`should extract create description nodes with markdown types`, async () => {
      await run(node)
      let types = groupBy(createdNodes, `internal.type`)
      expect(
        types.DocumentationJSComponentDescription.every(
          d => d.internal.mediaType === `text/markdown`
        )
      ).toBe(true)
    })
  })
})
