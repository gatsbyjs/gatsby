import Promise from 'bluebird'
import exiftool from 'node-exiftool'
import glob from 'glob'
import purdy from 'purdy'
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLInterfaceType,
} from 'graphql'
import {
  toGlobalId,
} from 'graphql-relay'
import _ from 'lodash'
import mapSeries from 'async/mapSeries'
const path = require(`path`)

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
      glob(`${pluginOptions.path}/**/**`, { nodir: true }, (err, files) => {
        console.timeEnd(`glob`)
        console.log(`parsed files count from ${pluginOptions.path}:`, files.length)

        const readMetadata = (file, cb) => {
          ep.readMetadata(file)
          .then((result) => cb(null, result))
          .catch((error) => console.log(error))
        }

        console.time(`readMetadata`)
        mapSeries(files, readMetadata, (err, results) => {
          console.timeEnd(`readMetadata`)
          console.log(`read metadata`)
          console.log(results.length)
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
          console.log('total files', mappedResults.length)
          console.time('create filesystem ast')
          // Create Unist nodes
          const ast = u(`rootDirectory`, {}, pluginOptions.path)
          ast.children = []
          mappedResults.forEach((file) => {
            file.sourceFile = slash(file.sourceFile)
            ast.children.push({
              type: `File`,
              id: toGlobalId(`File`, file.sourceFile),
              children: [],
              sourceFile: file.sourceFile,
              relativePath: path.posix.relative(pluginOptions.path, file.sourceFile),
              extension: file.ext.slice(1),
              name: file.name,
              extname: file.extname,
              filename: file.basename,
              dirname: file.dirname,
              modifyDate: file.fileModifyDate,
              accessDate: file.fileAccessDate,
              inodeChangeDate: file.fileInodeChangeDate,
              permissions: file.filePermissions,
            })
          })
          console.timeEnd(`create filesystem ast`)
          return resolve(ast)
        })
      })
    })
  })
}

//exports.compileASTToGraphQLTypes = ({ args }) => {
  //new GraphQLObjectType({
    //allFiles: {
      //type: fileConnection,
      //description: 'all files',
      //args: {
        //...connectionArgs,
      //},
      //resolve (object, args) {
        //const result = connectionFromArray(
          //mappedResults,
          //args,
        //)
        //result.totalCount = mappedResults.length
        //return result
      //},
    //},
  //})
//}
