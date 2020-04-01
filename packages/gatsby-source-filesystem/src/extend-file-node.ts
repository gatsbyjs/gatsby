import * as fs from "fs-extra"
import * as path from "path"
import { GraphQLString } from "gatsby/graphql"

export function extendFileNode({
  type,
  getNodeAndSavePathDependency,
  pathPrefix = ``,
}): {
  publicURL?: {
    type: GraphQLString
    args: { [key: string]: string }
    description: string
    resolve: (file, fieldArgs, context) => string
  }
} {
  if (type.name !== `File`) {
    return {}
  }

  return {
    publicURL: {
      type: GraphQLString,
      args: {},
      description: `Copy file to static directory and return public url to it`,
      resolve: (file, _fieldArgs, context): string => {
        const details = getNodeAndSavePathDependency(file.id, context.path)
        const fileName = `${file.internal.contentDigest}/${details.base}`

        const publicPath = path.join(
          process.cwd(),
          `public`,
          `static`,
          fileName
        )

        if (!fs.existsSync(publicPath)) {
          fs.copy(details.absolutePath, publicPath, err => {
            if (err) {
              console.error(
                `error copying file from ${details.absolutePath} to ${publicPath}`,
                err
              )
            }
          })
        }

        return `${pathPrefix}/static/${fileName}`
      },
    },
  }
}
