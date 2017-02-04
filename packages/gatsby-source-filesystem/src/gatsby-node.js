import Promise from 'bluebird'
import exiftool from 'node-exiftool'
import mapLimit from 'async/mapLimit'

const _ = require(`lodash`)
const path = require(`path`)
const md5File = require(`md5-file`)
const recursive = require('recursive-readdir')

const parseFilepath = require(`parse-filepath`)
const u = require(`unist-builder`)
const exiftoolBin = require(`dist-exiftool`)
const slash = require(`slash`)
const ep = new exiftool.ExiftoolProcess(exiftoolBin)
const isOpen = ep.open()

exports.sourceNodes = ({ args, pluginOptions }) => {
  return new Promise((resolve, reject) => {
    isOpen
    .catch((err) => reject(err))
    .then(() => {
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

          console.time(`readMetadata`)
          Promise.all(files.map((file) => ep.readMetadata(file)))
          .then((results) => {
            console.timeEnd(`readMetadata`)
            const cleanedResults = _.filter(results, (result) => {
              if (result.error === null) {
                return true
              } else {
                console.log(`errored result`, result)
                return false
              }
            })
            const mappedResults = cleanedResults.map((result) => {
              const intermediate = {
                ...result.data[0],
                ...parseFilepath(result.data[0].SourceFile),
              }
              const newObj = {}
              Object.keys(intermediate).forEach((key) => {
                newObj[_.camelCase(key)] = intermediate[key]
              })

              return newObj
            })

            console.time(`hash files`)
            // Get hash for each file.
            mapLimit(mappedResults, 15, (file, cb) => md5File(file.sourceFile, cb), (e, hashes) => {
              hashes.forEach((hash, index) => { mappedResults[index].hash = hash })
              console.timeEnd(`hash files`)

              console.log(`total files`, mappedResults.length)
              console.time(`create filesystem ast`)
              // Create Unist nodes
              const ast = u(`rootDirectory`, {}, pluginOptions.path)
              ast.children = []
              mappedResults.forEach((file) => {
                file.sourceFile = slash(file.sourceFile)
                ast.children.push({
                  type: `File`,
                  id: file.sourceFile,
                  sourceName: pluginOptions.name,
                  children: [],
                  sourceFile: file.sourceFile,
                  relativePath: path.posix.relative(pluginOptions.path, file.sourceFile),
                  extension: file.ext.slice(1).toLowerCase(),
                  name: file.name,
                  extname: file.extname,
                  filename: file.basename,
                  dirname: file.dirname,
                  modifyDate: file.fileModifyDate,
                  accessDate: file.fileAccessDate,
                  inodeChangeDate: file.fileInodeChangeDate,
                  permissions: file.filePermissions,
                  hash: file.hash,
                })
              })
              console.timeEnd(`create filesystem ast`)
              return resolve(ast)
            })
          })
        }
      )
    })
  })
}
