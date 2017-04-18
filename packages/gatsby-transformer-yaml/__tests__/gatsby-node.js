const Promise = require("bluebird")
const yaml = require("js-yaml")

const { onNodeCreate } = require("../src/gatsby-node")

describe(`Process YAML nodes correctly`, () => {
  const node = {
    id: "whatever",
    contentDigest: "whatever",
    mediaType: `text/yaml`,
    children: [],
    name: `test`,
  }

  // Make some fake functions its expecting.
  const loadNodeContents = node => {
    return Promise.resolve(node.contents)
  }

  it(`correctly creates nodes from JSON which is an array of objects`, async () => {
    const data = [{ blue: true, funny: "yup" }, { blue: false, funny: "nope" }]
    node.contents = yaml.safeDump(data)

    const createNode = jest.fn()
    const updateNode = jest.fn()
    const boundActionCreators = { createNode, updateNode }

    await onNodeCreate({
      node,
      loadNodeContents,
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
    node.contents = yaml.safeDump(data)

    const createNode = jest.fn()
    const updateNode = jest.fn()
    const boundActionCreators = { createNode, updateNode }

    await onNodeCreate({
      node,
      loadNodeContents,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls[0][0].id).toEqual("foo")
    })
  })
})
