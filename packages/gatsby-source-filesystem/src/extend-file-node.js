const { GraphQLString } = require(`graphql`)
const fs = require(`fs-extra`)
const path = require(`path`)

const staticPath = path.join(process.cwd(), `public`, `static`)

module.exports = ({ getNodeAndSavePathDependency, pathPrefix = ``, type }) =>
  type.name === `File`
    ? {
        publicURL: {
          args: {},
          description: `Copy file to static directory and return its public URL`,
          resolve: (file, _fieldArgs, context) => {
            const details = getNodeAndSavePathDependency(file.id, context.path)
            const digest = file.internal.contentDigest.slice(0, 6)
            const fileName = `${file.name}-${digest}${details.ext}`
            const publicPath = path.join(staticPath, fileName)

            if (!fs.existsSync(publicPath)) {
              fs.copy(details.absolutePath, publicPath, err => {
                if (err) {
                  console.error(
                    `error copying "${
                      details.absolutePath
                    }" to "${publicPath}"`,
                    err
                  )
                }
              })
            }

            return `${pathPrefix}/static/${fileName}`
          },
          type: GraphQLString,
        },
      }
    : {}
