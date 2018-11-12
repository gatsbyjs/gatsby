const { getById, getNodesByType } = require(`../db`)
const { findByIdsAndType } = require(`../resolvers`)

const addConvenienceChildrenFields = tc => {
  const typeName = tc.getTypeName()
  const nodes = getNodesByType(typeName)

  const childrenByType = nodes.reduce((acc, node) => {
    const children = node.children.map(getById)
    children.forEach(child => {
      const { type } = child.internal
      acc[type] = (acc[type] || []).concat(child)
    })
    return acc
  }, {})

  Object.entries(childrenByType).forEach(([typeName, children]) => {
    const childrenCountByParent = children.reduce((acc, { parent }) => {
      acc[parent] = acc[parent] ? acc[parent]++ : 1
      return acc
    }, {})

    const hasOneChildOnly =
      Math.max(...Object.values(childrenCountByParent)) <= 1
    const fieldName = (hasOneChildOnly ? `child` : `children`) + typeName
    const type = hasOneChildOnly ? typeName : [typeName]

    const field = {
      [fieldName]: {
        type,
        resolve: (source, args, context, info) =>
          findByIdsAndType(type)(
            { source, args: { ids: source.children }, context, info },
            hasOneChildOnly
          ),
      },
    }

    tc.addFields(field)
  })
}

module.exports = addConvenienceChildrenFields
