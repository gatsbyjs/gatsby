const { getNamedType } = require(`graphql`)

const hasResolvers = (parentType, filterFields) => {
  const fields = parentType.getFields()
  return Object.entries(filterFields).some(([fieldName, filterValue]) => {
    const field = fields[fieldName]
    return (
      Boolean(field.resolve) ||
      (filterValue !== true &&
        hasResolvers(getNamedType(field.type), filterValue))
    )
  })
}

module.exports = hasResolvers
