exports.createSchemaCustomization = ({ actions }, pluginOptions) => {
  global.test = pluginOptions.fn()

  const { createTypes } = actions

  createTypes(`
    type NodeTypeTwo implements Node {
      thisIsANumber: Int
      string: String
      arrayOfStrings: [String]
    }

    type NodeTypeOne implements Node {
      overriddenString: Int
    }
  `)
}

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  const testData = {
    number: 123,
    string: 'Hello World',
    overriddenString: '1',
    arrayOfStrings: [`Foo`, `Bar`],
    object: {
      foo: 'bar',
      bar: 'baz'
    }
  }

  const nodeMeta = {
    id: createNodeId(`node-type-one-${testData.number}`),
    parent: null,
    children: [],
    internal: {
      type: `NodeTypeOne`,
      content: JSON.stringify(testData),
      contentDigest: createContentDigest(testData)
    }
  }

  const node = Object.assign({}, testData, nodeMeta)

  createNode(node)
}
