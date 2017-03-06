import Promise from "bluebird"
import mapLimit from "async/mapLimit"

const _ = require("lodash")
const path = require("path")
const md5File = require("md5-file")
const recursive = require("recursive-readdir")
const fs = require("fs")
const prettyBytes = require("pretty-bytes")
const u = require("unist-builder")
const slash = require("slash")

exports.sourceNodes = ({ args, pluginOptions }) => new Promise((
  resolve,
  reject,
) => {
  console.time(`glob`)
  recursive(
    pluginOptions.path,
    [
      `.*.un~`,
      `.gitignore`,
      `.npmignore`,
      `.babelrc`,
      `yarn.lock`,
      `../**/dist/**`,
    ],
    (err, files) => {
      console.timeEnd(`glob`)
      console.log(`total files`, files.length)

      // Parse files
      const mappedFiles = files.map(file => {
        const slashed = slash(file)
        return {
          ...path.parse(slashed),
          absolutePath: slashed,
        }
      })

      console.time(`hash files`)
      // Get hash for each file.
      mapLimit(
        mappedFiles,
        15,
        (file, cb) => md5File(file.absolutePath, cb),
        (e, hashes) => {
          hashes.forEach((hash, index) => {
            mappedFiles[index].hash = hash
          })
          console.timeEnd(`hash files`)

          console.time(`stat files`)
          mapLimit(
            mappedFiles,
            15,
            (file, cb) => fs.stat(file.absolutePath, cb),
            (er, stats) => {
              stats.forEach((stat, index) => {
                mappedFiles[index] = {
                  ...stat,
                  ...mappedFiles[index],
                }
              })
              console.timeEnd(`stat files`)

              console.log(`total files`, mappedFiles.length)
              console.time(`create filesystem ast`)
              // Create Unist nodes
              const ast = u(`rootDirectory`, {}, pluginOptions.path)
              ast.children = []
              mappedFiles.forEach(file => {
                ast.children.push({
                  ...JSON.parse(JSON.stringify(file)), // Stringify date objects.
                  type: `File`,
                  id: file.absolutePath,
                  sourceName: pluginOptions.name,
                  children: [],
                  relativePath: slash(
                    path.posix.relative(pluginOptions.path, file.absolutePath),
                  ),
                  extension: file.ext.slice(1).toLowerCase(),
                  size: file.size,
                  prettySize: prettyBytes(file.size),
                  modifiedTime: file.mtime.toJSON(),
                  accessTime: file.atime.toJSON(),
                  changeTime: file.ctime.toJSON(),
                  birthTime: file.birthtime.toJSON(),
                  hash: file.hash,
                })
              })
              console.timeEnd(`create filesystem ast`)
              return resolve(ast)
            },
          )
        },
      )
    },
  )
})
