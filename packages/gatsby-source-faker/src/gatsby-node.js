const faker = require(`faker`)

const range = n => Array.from(Array(n).keys())

exports.sourceNodes = (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createNode } = actions
  const { schema, count, type } = pluginOptions

  return Promise.all(
    range(count).map(() => {
      let item = {}
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
      return createNode(Object.assign({}, nodeBase, item))
    })
  )
}
