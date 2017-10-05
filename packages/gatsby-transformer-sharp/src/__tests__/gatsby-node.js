const { onCreateNode } = require(`../gatsby-node`)

describe(`Process image nodes correctly`, () => {
  let node
  let createNode
  let createParentChildLink
  let boundActionCreators

  beforeEach(() => {
    node = {
      id: `whatever`,
      children: [],
      internal: {
        contentDigest: `whatever`,
      },
    }
    createNode = jest.fn()
    createParentChildLink = jest.fn()
    boundActionCreators = { createNode, createParentChildLink }
  })

  it(`correctly creates an ImageSharp node from a file image node`, async () => {
    node.extension = `png`

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

  it(`ignores nodes with non-supported extensions`, async () => {
    node.extension = `json`

    await onCreateNode({
      node,
      boundActionCreators,
    }).then(() => {
      expect(createNode).toHaveBeenCalledTimes(0)
      expect(createParentChildLink).toHaveBeenCalledTimes(0)
    })
  })

  it(`correctly creates an ImageSharp node from a file image node with a user-defined extension`, async () => {
    node.extension = `svg`

    await onCreateNode({
      node,
      boundActionCreators,
    }, {
      fileExtensions: [`jpeg`, `jpg`, `png`, `webp`, `tif`, `tiff`, `svg`],
    }).then(() => {
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })
})
