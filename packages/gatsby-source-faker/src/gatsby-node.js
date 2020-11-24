const faker = require(`faker`)

exports.sourceNodes = (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
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

exports.createSchemaCustomization = ({ actions, schema }, pluginOptions) => {
  const { createTypes } = actions
  const { schema: optionsSchema, type } = pluginOptions

  Object.keys(optionsSchema).map(schemaKey => {
    let fields = {}
    const schemaItemList = optionsSchema[schemaKey]

    schemaItemList.forEach(schemaItem => {
      fields[schemaItem] = `String`
    })

    const typeDefs = [
      schema.buildObjectType({
        name: `${type}${schemaKey[0].toUpperCase() + schemaKey.substring(1)}`,
        fields,
      }),
    ]

    createTypes(typeDefs)
  })

  let fields = {}
  Object.keys(optionsSchema).map(schemaKey => {
    fields[schemaKey] = `${type}${
      schemaKey[0].toUpperCase() + schemaKey.substring(1)
    }`
  })

  const typeDefs = [
    schema.buildObjectType({
      name: type,
      fields,
      interfaces: [`Node`],
      extensions: {
        infer: true,
      },
    }),
  ]
  createTypes(typeDefs)
}
