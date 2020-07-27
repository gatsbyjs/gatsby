const path = require(`path`)

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    Query: {
      queryModule: {
        type: `String`,
        args: {
          moduleFileName: {
            type: `String`,
          },
        },
        resolve: (source, args, context) => {
          return context.pageModel.setModule({
            source: path.resolve(`./src/query-modules/${args.moduleFileName}`),
          })
        },
      },
    },
  })
}
