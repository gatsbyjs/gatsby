const { GraphQLString } = require(`gatsby/graphql`)
const fs = require(`fs-extra`)
const path = require(`path`)

module.exports = ({ type, getNodeAndSavePathDependency, pathPrefix = `` }, pluginOptions) => {
  if (type.name !== `File`) {
    return {}
  }

  const { fileDestinationDir } = pluginOptions

  const newPublicPath = (fileName, fileDestinationDir) => {
    if (fileDestinationDir) {
      return path.posix.join(process.cwd(), `public`, fileDestinationDir, fileName)
    }
    return path.posix.join(process.cwd(), `public`, `static`, fileName)
  }

  const newLinkURL = (fileName, fileDestinationDir, pathPrefix) => {
    const linkPaths = [
      `/`,
      pathPrefix,
      fileDestinationDir,
      fileName,
    ].filter(function (lpath) {
      if (lpath) return true
      return false
    })

    return path.posix.join(...linkPaths)
  }

  return {
    publicURL: {
      type: GraphQLString,
      args: {},
      description: `Copy file to static directory and return public url to it`,
      resolve: (file, fieldArgs, context) => {
        const details = getNodeAndSavePathDependency(file.id, context.path)
        const fileName = `${file.name}-${file.internal.contentDigest}${
          details.ext
        }`

        const publicPath = newPublicPath(fileName, fileDestinationDir);

        if (!fs.existsSync(publicPath)) {
          fs.copy(details.absolutePath, publicPath, err => {
            if (err) {
              console.error(
                `error copying file from ${
                  details.absolutePath
                } to ${publicPath}`,
                err
              )
            }
          })
        }

        return newLinkURL(fileName, fileDestinationDir, pathPrefix);
      },
    },
  }
}
