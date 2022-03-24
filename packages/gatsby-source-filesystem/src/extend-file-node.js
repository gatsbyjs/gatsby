const { GraphQLString } = require(`gatsby/graphql`)
const fs = require(`fs-extra`)
const path = require(`path`)
const { prefixId, CODES } = require(`./error-utils`)

module.exports = ({
  type,
  getNodeAndSavePathDependency,
  pathPrefix = ``,
  reporter,
}) => {
  if (type.name !== `File`) {
    return {}
  }

  return {
    publicURL: {
      type: GraphQLString,
      args: {},
      description: `Copy file to static directory and return public url to it`,
      resolve: (file, fieldArgs, context) => {
        const details = getNodeAndSavePathDependency(file.id, context.path)
        const fileName = `${file.internal.contentDigest}/${details.base}`

        const publicPath = path.join(
          process.cwd(),
          `public`,
          `static`,
          fileName
        )

        fs.copySync(
          details.absolutePath,
          publicPath,
          {
            overwrite: false,
            dereference: true,
          },
          err => {
            // Node.js best practices dictate to copy the file and handle the
            // error without checking if it exists. Otherwise we introduce a
            // race condition.
            // 
            // It is possible we have valid errors from:
            //   EBUSY: file busy (being transferred)
            //   EOPEN: file open (being transferred)
            //   EEXIST: file exists (already transferred)
            // What would be a true error and where we should panic:
            //    ENOENT: file does not exist
            if (err && err.code === "ENOENT") {
              reporter.panic(
                {
                  id: prefixId(CODES.MissingResource),
                  context: {
                    sourceMessage: `error copying file from ${details.absolutePath} to ${publicPath}`,
                  },
                },
                err
              )
            }
          }
        )

        return `${pathPrefix}/static/${fileName}`
      },
    },
  }
}
