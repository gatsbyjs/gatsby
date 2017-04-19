const path = require("path")
const md5File = require("md5-file")
const fs = require("fs")
const prettyBytes = require("pretty-bytes")
const slash = require("slash")
const chokidar = require("chokidar")
const mime = require("mime")

function readFile(file, pluginOptions, cb) {
  const slashed = slash(file)
  const slashedFile = {
    ...path.parse(slashed),
    absolutePath: slashed,
  }
  md5File(slashedFile.absolutePath, (md5Err, contentDigest) => {
    fs.stat(slashedFile.absolutePath, (statErr, stats) => {
      // Stringify date objects.
      const newFile = JSON.parse(
        JSON.stringify({
          id: `${slashedFile.absolutePath}`,
          contentDigest: contentDigest,
          children: [],
          parent: `___SOURCE___`,
          mediaType: mime.lookup(slashedFile.ext),
          type: `File`,
          sourceName: pluginOptions.name,
          absolutePath: slashedFile.absolutePath,
          relativePath: slash(
            path.relative(pluginOptions.path, slashedFile.absolutePath)
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

exports.sourceNodes = ({ boundActionCreators, getNode }, pluginOptions) => {
  const { createNode, updateSourcePluginStatus } = boundActionCreators
  updateSourcePluginStatus({
    plugin: `source-filesystem --- ${pluginOptions.name}`,
    ready: false,
  })
  const watcher = chokidar.watch(pluginOptions.path, {
    ignored: [
      `**/*.un~`,
      `**/.gitignore`,
      `**/.npmignore`,
      `**/.babelrc`,
      `**/yarn.lock`,
      `**/node_modules`,
      `../**/dist/**`,
    ],
  })

  watcher.on(`add`, path => {
    // console.log("Added file at", path)
    readFile(path, pluginOptions, (err, file) => {
      // Only create node if the content digest has changed.
      if (!getNode(file.id)) {
        createNode(file)
      } else {
        // console.log("not creating node cause it already exists", file.id)
      }
    })
  })
  watcher.on(`change`, path => {
    console.log("changed file at", path)
    readFile(path, pluginOptions, (err, file) => {
      // Only create node if the content digest has changed.
      if (!getNode(file.id)) {
        createNode(file)
      }
    })
  })
  watcher.on(`ready`, () => {
    updateSourcePluginStatus({
      plugin: `source-filesystem --- ${pluginOptions.name}`,
      ready: true,
    })
  })

  // TODO add delete support.
  return
}
