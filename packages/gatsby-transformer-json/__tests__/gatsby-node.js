const Promise = require("bluebird")

const { onNodeCreate } = require("../src/gatsby-node")

describe(`Process JSON nodes correctly`, () => {
  const node = {
    id: "whatever",
    contentDigest: "whatever",
    mediaType: `application/json`,
    children: [],
    name: `test`,
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => {
    return Promise.resolve(node.content)
  }

  it(`correctly creates nodes from JSON which is an array of objects`, async () => {
    const data = [
      { id: "foo", blue: true, funny: "yup" },
      { blue: false, funny: "nope" },
    ]
    node.content = JSON.stringify(data)

    const createNode = jest.fn()
    const updateNode = jest.fn()
    const boundActionCreators = { createNode, updateNode }

    await onNodeCreate({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(updateNode.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2)
      expect(updateNode).toHaveBeenCalledTimes(1)
    })
  })

  it(`If the object has an id, it uses that as the id instead of the contentDigest`, async () => {
    const data = [
      { id: "foo", blue: true, funny: "yup" },
      { blue: false, funny: "nope" },
    ]
    node.content = JSON.stringify(data)

    const createNode = jest.fn()
    const updateNode = jest.fn()
    const boundActionCreators = { createNode, updateNode }

    await onNodeCreate({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls[0][0].id).toEqual("foo")
    })
  })
})
