const faker = require(`faker`)
const crypto = require(`crypto`)

exports.sourceNodes = ({ boundActionCreators }, pluginOptions) => {
  const { createNode } = boundActionCreators
  const { schema, count, type } = pluginOptions
  for (let i = 0; i < count; i++) {
    let item = {}
    Object.keys(schema).map(schemaKey => {
      const schemaItemList = schema[schemaKey]
      item[schemaKey] = {}
      // ['firstName', 'lastName']
      schemaItemList.forEach(schemaItem => {
        item[schemaKey][schemaItem] = faker[schemaKey][schemaItem]()
      })
    })
    const contentDigest = crypto
      .createHash(`md5`)
      .update(JSON.stringify(item))
      .digest(`hex`)

    const nodeBase = {
      id: JSON.stringify(faker.random.number()),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest,
      },
    }
    createNode(Object.assign({}, nodeBase, item))
  }
}
