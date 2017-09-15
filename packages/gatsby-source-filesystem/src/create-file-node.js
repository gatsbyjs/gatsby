const slash = require(`slash`)
const path = require(`path`)
const fs = require(`fs-extra`)
const mime = require(`mime`)
const prettyBytes = require(`pretty-bytes`)

const md5File = require(`bluebird`).promisify(require(`md5-file`))

const createId = path => {
  const slashed = slash(path)
  return `${slashed} absPath of file`
}

exports.createId = createId

exports.createFileNode = async (pathToFile, pluginOptions = {}) => {
  const slashed = slash(pathToFile)
  const slashedFile = {
    ...path.parse(slashed),
    absolutePath: slashed,
  }
  // console.log('createFileNode', slashedFile.absolutePath)
  const contentDigest = await md5File(slashedFile.absolutePath)
  const stats = await fs.stat(slashedFile.absolutePath)

  // console.log('createFileNode:stat', slashedFile.absolutePath)
  // Stringify date objects.
  return JSON.parse(
    JSON.stringify({
      // Don't actually make the File id the absolute path as otherwise
      // people will use the id for that and ids shouldn't be treated as
      // useful information.
      id: createId(pathToFile),
      children: [],
      parent: `___SOURCE___`,
      internal: {
        contentDigest: contentDigest,
        mediaType: mime.lookup(slashedFile.ext),
        type: `File`,
      },
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
