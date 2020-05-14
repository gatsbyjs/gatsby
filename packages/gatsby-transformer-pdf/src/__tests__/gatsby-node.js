const path = require(`path`)
const { onCreateNode } = require(`../gatsby-node`)

describe(`gatsby-transformer-pdf`, () => {
  let node
  let actions
  let loadNodeContent
  let createNodeId
  let createContentDigest

  beforeEach(() => {
    node = {
      id: `dummy`,
      extension: `pdf`,
      absolutePath: path.resolve(__dirname, `../__fixtures__/dummy.pdf`),
    }
    actions = {
      createNode: jest.fn(),
      createParentChildLink: jest.fn(),
    }
    loadNodeContent = jest.fn()
    createNodeId = jest.fn(node => node)
    createContentDigest = jest.fn(() => `digest`)
  })

  it(`should do nothing if file extension is not pdf`, async () => {
    node.extension = `js`
    await onCreateNode({
      node,
      actions,
      loadNodeContent,
      createNodeId,
      createContentDigest,
    })
    expect(createNodeId).not.toHaveBeenCalled()
  })

  it(`should create node base on pdf data`, async () => {
    await onCreateNode({
      node,
      actions,
      loadNodeContent,
      createNodeId,
      createContentDigest,
    })
    expect(actions.createNode).toHaveBeenCalledWith({
      children: [],
      content: expect.any(String),
      id: `dummy >>> pdf`,
      internal: { contentDigest: `digest`, type: `pdf` },
      parent: `dummy`,
    })
    expect(actions.createParentChildLink).toHaveBeenCalledWith({
      child: {
        children: [],
        content: expect.any(String),
        id: `dummy >>> pdf`,
        internal: { contentDigest: `digest`, type: `pdf` },
        parent: `dummy`,
      },
      parent: node,
    })
    expect(actions.createNode.mock.calls[0][0].content).toMatchSnapshot()
  })
})
