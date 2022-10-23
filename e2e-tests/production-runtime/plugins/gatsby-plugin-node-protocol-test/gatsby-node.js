const path = require(`node:path`)

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    Query: {
      fieldWithResolverThatMakeUseOfImportWithNodeProtocol: {
        type: `String`,
        args: {
          left: `String!`,
          right: `String!`,
        },
        resolve: (_, args) => {
          return path.posix.join(args.left, args.right)
        },
      },
    },
  })
}
