const Promise = require(`bluebird`)
const HJSON = require(`hjson`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process HJSON nodes correctly`, () => {
  const node = {
    name: `nodeName`,
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `application/hjson`,
      name: `test`,
    },
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`correctly creates nodes from HJSON which is an array of objects`, async () => {
    const data = [
      { id: `foo`, blue: true, funny: `yup` },
      { blue: false, funny: `nope` },
    ]
    node.content = HJSON.stringify(data)

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

  it(`correctly creates a node from HJSON which is a single object`, async () => {
    const data = { id: `foo`, blue: true, funny: `yup` }
    node.content = HJSON.stringify(data)
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
})
