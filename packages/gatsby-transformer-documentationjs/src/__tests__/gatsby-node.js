import groupBy from "lodash/groupBy"
import path from "path"
import gatsbyNode from "../gatsby-node"

describe(`transformer-react-doc-gen: onCreateNode`, () => {
  let actions, node, createdNodes, updatedNodes
  const createNodeId = jest.fn()
  createNodeId.mockReturnValue(`uuid-from-gatsby`)
  let run = (node = node, opts = {}) =>
    gatsbyNode.onCreateNode(
      {
        node,
        actions,
        createNodeId,
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

  it(`should extract out a description, params, and examples`, async () => {
    await run(node)
    expect(createdNodes).toMatchSnapshot()
  })

  it(`should only process javascript File nodes`, async () => {
    let result
    result = await run({ internal: { mediaType: `text/x-foo` } })
    expect(result).toBeNull()

    result = await run({ internal: { mediaType: `application/javascript` } })
    expect(result).toBeNull()

    result = await run({
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
