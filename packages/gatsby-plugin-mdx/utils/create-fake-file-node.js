const slash = require(`slash`)
const path = require(`path`)
const fs = require(`fs`)
const mime = require(`mime`)
const prettyBytes = require(`pretty-bytes`)
const crypto = require(`crypto`)
const md5File = require(`md5-file`)

exports.createFileNode = async (
  pathToFile,
  createNodeId,
  pluginOptions = {}
) => {
  const slashed = slash(pathToFile)
  const parsedSlashed = path.parse(slashed)
  const slashedFile = {
    ...parsedSlashed,
    absolutePath: slashed,
    // Useful for limiting graphql query with certain parent directory
    relativeDirectory: path.relative(
      pluginOptions.path || process.cwd(),
      parsedSlashed.dir
    ),
  }

  const stats = fs.statSync(slashedFile.absolutePath)
  let internal
  if (stats.isDirectory()) {
    const contentDigest = crypto
      .createHash(`md5`)
      .update(
        JSON.stringify({ stats: stats, absolutePath: slashedFile.absolutePath })
      )
      .digest(`hex`)
    internal = {
      contentDigest,
      type: `Directory`,
      description: `Directory "${path.relative(process.cwd(), slashed)}"`,
    }
  } else {
    const contentDigest = md5File.sync(slashedFile.absolutePath)
    const mediaType = mime.getType(slashedFile.ext)
    internal = {
      contentDigest,
      type: `File`,
      mediaType: mediaType ? mediaType : `application/octet-stream`,
      description: `File "${path.relative(process.cwd(), slashed)}"`,
    }
  }

  // Stringify date objects.
  return JSON.parse(
    JSON.stringify({
      // Don't actually make the File id the absolute path as otherwise
      // people will use the id for that and ids shouldn't be treated as
      // useful information.
      id: createNodeId(pathToFile),
      children: [],
      parent: `___SOURCE___`,
      internal,
      sourceInstanceName: pluginOptions.name || `__PROGRAMATTIC__`,
      absolutePath: slashedFile.absolutePath,
      relativePath: slash(
        path.relative(
          pluginOptions.path || process.cwd(),
          slashedFile.absolutePath
        )
      ),
      extension: slashedFile.ext.slice(1).toLowerCase(),
      size: stats.size,
      prettySize: prettyBytes(stats.size),
      modifiedTime: stats.mtime,
      accessTime: stats.atime,
      changeTime: stats.ctime,
      birthTime: stats.birthtime,
      ...slashedFile,
      ...stats,
    })
  )
}
