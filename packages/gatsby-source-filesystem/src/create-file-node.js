const slash = require(`slash`)
const path = require(`path`)
const md5File = require(`md5-file`)
const fs = require(`fs`)
const mime = require(`mime`)
const prettyBytes = require(`pretty-bytes`)

const createId = path => {
  const slashed = slash(path)
  return `${slashed} absPath of file`
}

exports.createId = createId

exports.createFileNode = (pathToFile, pluginOptions = {}, cb) => {
  const slashed = slash(pathToFile)
  const slashedFile = {
    ...path.parse(slashed),
    absolutePath: slashed,
  }
  md5File(slashedFile.absolutePath, (md5Err, contentDigest) => {
    fs.stat(slashedFile.absolutePath, (statErr, stats) => {
      // Stringify date objects.
      const newFile = JSON.parse(
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
      cb(null, newFile)
    })
  })
}
