const Promise = require(`bluebird`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process image nodes correctly`, () => {
  it(`correctly creates an ImageSharp node from a file image node`, async () => {
    const node = {
      extension: `png`,
      id: `whatever`,
      children: [],
      internal: {
        contentDigest: `whatever`,
      },
    }
    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode({
      node,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })
})
