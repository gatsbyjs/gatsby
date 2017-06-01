const path = require(`path`)
const md5File = require(`md5-file`)
const fs = require(`fs`)
const prettyBytes = require(`pretty-bytes`)
const slash = require(`slash`)
const chokidar = require(`chokidar`)
const mime = require(`mime`)

const createId = path => {
  const slashed = slash(path)
  return `${slashed} absPath of file`
}

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
          // Don't actually make the File id the absolute path as otherwise
          // people will use the id for that and ids shouldn't be treated as
          // useful information.
          id: createId(file),
          children: [],
          parent: `___SOURCE___`,
          internal: {
            contentDigest: contentDigest,
            mediaType: mime.lookup(slashedFile.ext),
            type: `File`,
          },
          sourceInstanceName: pluginOptions.name,
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

exports.sourceNodes = (
  { boundActionCreators, getNode, hasNodeChanged },
  pluginOptions,
  done
) => {
  const { createNode, deleteNode } = boundActionCreators

  let ready = false

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

  // For every path that is reported before the 'ready' event, we throw them
  // into a queue and then flush the queue when 'ready' event arrives.
  // After 'ready', we handle the 'add' event without putting it into a queue.
  let pathQueue = []
  const flushPathQueue = onComplete => {
    let queue = pathQueue
    pathQueue = []

    let numPathsProcessed = 0
    let numPaths = queue.length

    queue.forEach(path => {
      readFile(path, pluginOptions, (err, file) => {
        createNode(file)

        numPathsProcessed++
        if (numPathsProcessed === numPaths) {
          onComplete()
        }
      })
    })
  }

  watcher.on(`add`, path => {
    if (ready) {
      console.log(`added file at`, path)
      readFile(path, pluginOptions, (err, file) => {
        createNode(file)
      })
    } else {
      pathQueue.push(path)
    }
  })
  watcher.on(`change`, path => {
    console.log(`changed file at`, path)
    readFile(path, pluginOptions, (err, file) => {
      createNode(file)
    })
  })
  watcher.on(`unlink`, path => {
    console.log(`file deleted at`, path)
    deleteNode(createId(path))
  })
  watcher.on(`ready`, () => {
    if (ready) {
      return
    }

    ready = true
    flushPathQueue(() => {
      console.log("source-filesystem is done")
      done()
    })
  })

  return
}
