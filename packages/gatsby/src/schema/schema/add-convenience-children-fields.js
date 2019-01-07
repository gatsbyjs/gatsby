const { getById, getNodesByType } = require(`../db`)
const { findByIdsAndType } = require(`../resolvers`)

const addConvenienceChildrenFields = tc => {
  const typeName = tc.getTypeName()
  const nodes = getNodesByType(typeName)

  const hasChildrenByType = nodes.reduce((acc, node) => {
    const children = node.children.map(getById)
    const childrenCountByType = children.reduce((acc, child) => {
      const { type } = child.internal
      acc[type] = acc[type] + 1 || 1
      return acc
    }, {})
    Object.entries(childrenCountByType).forEach(([type, count]) => {
      acc[type] = Boolean(acc[type]) || count > 1
    })
    return acc
  }, {})

  Object.entries(hasChildrenByType).forEach(([typeName, hasChildren]) => {
    const fieldName = (hasChildren ? `children` : `child`) + typeName
    const type = hasChildren ? [typeName] : typeName
    const field = {
      [fieldName]: {
        type,
        resolve: (source, args, context, info) =>
          findByIdsAndType(typeName)(
            {
              source,
              args: {
                ids: source.children,
              },
              context,
              info,
            },
            !hasChildren
          ),
      },
    }
    tc.addFields(field)
  })
}

module.exports = addConvenienceChildrenFields
