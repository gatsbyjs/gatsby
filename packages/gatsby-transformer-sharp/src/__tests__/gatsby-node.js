const Promise = require(`bluebird`)

const { onNodeCreate } = require(`../gatsby-node`)

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
    const updateNode = jest.fn()
    const boundActionCreators = { createNode, updateNode }

    await onNodeCreate({
      node,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(updateNode.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(updateNode).toHaveBeenCalledTimes(1)
    })
  })
})
