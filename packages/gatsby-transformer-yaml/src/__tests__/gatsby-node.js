const Promise = require(`bluebird`)
const yaml = require(`js-yaml`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process YAML nodes correctly`, () => {
  const node = {
    id: `whatever`,
    parent: `SOURCE`,
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
    const data = { blue: true, funny: `yup` }
    node.content = yaml.safeDump(data)
    node.dir = `/tmp/bar/`

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
