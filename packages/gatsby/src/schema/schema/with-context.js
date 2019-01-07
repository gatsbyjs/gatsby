const resolvers = require(`../resolvers`)

// NOTE:
// info.schema.getQueryType().getFields().allTypeName.resolve
// and
// info.schema.getQueryType().getFields().typeName.resolve
// are the same as
// context.resolvers.findMany(`typeName`)
// and
// context.resolvers.findOne(`typeName`)
// *except* the `info` resolvers accept an argument list,
// while the `context` resolvers accept an argument object,
// i.e. resolve(source, args, context, info)
// vs. resolve({ source, args, context, info })
const withContext = resolve => (source, args, context, info) =>
  resolve(source, args, { ...context, resolvers }, info)

module.exports = withContext
