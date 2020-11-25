const path = require(`path`)
const fs = require(`fs-extra`)
const mime = require(`mime`)
const prettyBytes = require(`pretty-bytes`)

const md5File = require(`md5-file`)
const { createContentDigest, slash } = require(`gatsby-core-utils`)

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
    relativeDirectory: slash(
      path.relative(pluginOptions.path || process.cwd(), parsedSlashed.dir)
    ),
  }

  const stats = await fs.stat(slashedFile.absolutePath)
  let internal
  if (stats.isDirectory()) {
    const contentDigest = createContentDigest({
      stats: stats,
      absolutePath: slashedFile.absolutePath,
    })
    internal = {
      contentDigest,
      type: `Directory`,
      description: `Directory "${path.relative(process.cwd(), slashed)}"`,
    }
  } else {
    const contentDigest = await md5File(slashedFile.absolutePath)
    const mediaType = mime.getType(slashedFile.ext)
    internal = {
      contentDigest,
      type: `File`,
      mediaType: mediaType ? mediaType : `application/octet-stream`,
      description: `File "${path.relative(process.cwd(), slashed)}"`,
    }
  }

  return {
    // Don't actually make the File id the absolute path as otherwise
    // people will use the id for that and ids shouldn't be treated as
    // useful information.
    id: createNodeId(pathToFile),
    children: [],
    parent: null,
    internal,
    sourceInstanceName: pluginOptions.name || `__PROGRAMMATIC__`,
    relativePath: slash(
      path.relative(
        pluginOptions.path || process.cwd(),
        slashedFile.absolutePath
      )
    ),
    extension: slashedFile.ext.slice(1).toLowerCase(),
    prettySize: prettyBytes(stats.size),
    modifiedTime: stats.mtime.toJSON(),
    accessTime: stats.atime.toJSON(),
    changeTime: stats.ctime.toJSON(),
    birthTime: stats.birthtime.toJSON(),
    // Note: deprecate splatting the slashedFile object
    // Note: the object may contain different properties depending on File or Dir
    ...slashedFile,
    // TODO: deprecate copying the entire object
    // Note: not splatting for perf reasons (make sure Date objects are serialized)
    dev: stats.dev,
    mode: stats.mode,
    nlink: stats.nlink,
    uid: stats.uid,
    rdev: stats.rdev,
    blksize: stats.blksize,
    ino: stats.ino,
    size: stats.size,
    blocks: stats.blocks,
    atimeMs: stats.atimeMs,
    mtimeMs: stats.mtimeMs,
    ctimeMs: stats.ctimeMs,
    birthtimeMs: stats.birthtimeMs,
    atime: stats.atime.toJSON(),
    mtime: stats.mtime.toJSON(),
    ctime: stats.ctime.toJSON(),
    birthtime: stats.birthtime.toJSON(),
  }
}
