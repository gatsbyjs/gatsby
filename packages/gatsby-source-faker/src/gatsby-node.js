const faker = require(`faker`)

exports.sourceNodes = (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createNode } = actions
  const { schema, count, type } = pluginOptions
  for (let i = 0; i < count; i++) {
    const item = {}
    Object.keys(schema).map(schemaKey => {
      const schemaItemList = schema[schemaKey]
      item[schemaKey] = {}
      // ['firstName', 'lastName']
      schemaItemList.forEach(schemaItem => {
        item[schemaKey][schemaItem] = faker[schemaKey][schemaItem]()
      })
    })

    const nodeBase = {
      id: createNodeId(JSON.stringify(faker.random.number())),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest: createContentDigest(item),
      },
    }
    createNode(Object.assign({}, nodeBase, item))
  }
}
