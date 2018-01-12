const faker = require(`faker`)
const crypto = require(`crypto`)
const uuidv5 = require(`uuid/v5`)

const seedConstant = `2f268b09-35a2-4ddf-8047-2f04d04c33f3`
const createId = (id) =>
  uuidv5(id, uuidv5(`faker`, seedConstant))

exports.sourceNodes = ({ actions }, pluginOptions) => {
  const { createNode } = actions
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
      id: createId(JSON.stringify(faker.random.number())),
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
