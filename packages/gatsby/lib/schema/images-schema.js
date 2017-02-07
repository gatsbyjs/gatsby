import exiftool from "node-exiftool"
import glob from "glob"
import Promise from "bluebird"
import _ from "lodash"
import moment from "moment"
import qs from "querystring"
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
} from "graphql"
import {
  connectionFromArray,
  connectionArgs,
  connectionDefinitions,
} from "graphql-relay"
import sharp from "sharp"
import md5File from "md5-file"
import MarkdownIt from "markdown-it"
import parseFilepath from "parse-filepath"

const md = new MarkdownIt({
  html: true,
  typographer: true,
})

//import inferGraphQLType from './infer-graphql-type'

const ep = new exiftool.ExiftoolProcess(`/usr/local/bin/exiftool`)
const isOpen = ep.open()

module.exports = directory => new Promise((resolve, reject) => {
  isOpen.catch(err => reject(err)).then(() => {
    glob(`${directory}/**/?(*.png|*.jpg|*.jpeg)`, (err, files) => {
      Promise.all(files.map(file => ep.readMetadata(file))).then(results => {
        const cleanedResults = _.filter(
            results,
            result => result.error === null
          )
        let mappedResults = cleanedResults.map(result => result.data[0])
        mappedResults = mappedResults.map(image => {
            // Set path from FileName
          const parsedPath = parseFilepath(image.FileName)
          image.path = `/${
              _.kebabCase(`${parsedPath.dir}/${parsedPath.name}`)
              }/`
            // Render description as markdown (if set).
          if (image.Description) {
            image.Description = md.render(
                image.Description.replace(/<br \/>/g, `\n`)
              )
          }
          return image
        })
        const ImageType = new GraphQLObjectType({
          name: `Image`,
          fields: {
            SourceFile: { type: GraphQLString },
            FileName: { type: GraphQLString },
            FileSize: { type: GraphQLString },
            FileType: { type: GraphQLString },
            ImageWidth: { type: GraphQLInt },
            ImageHeight: { type: GraphQLInt },
            Caption: { type: GraphQLString },
            Description: { type: GraphQLString },
            path: { type: GraphQLString },
            Date: {
              type: GraphQLString,
              args: {
                formatString: {
                    type: GraphQLString,
                  },
              },
              resolve ({ Date }, { formatString }) {
                if (formatString) {
                    return moment(Date, `YYYY:MM:DD HH:mm:ssZ`).format(
                      formatString
                    )
                  } else {
                    return Date
                  }
              },
            },
            image: {
              type: new GraphQLObjectType({
                name: `ImageSrc`,
                fields: {
                    src: { type: GraphQLString },
                    width: { type: GraphQLInt },
                    height: { type: GraphQLInt },
                  },
              }),
              args: {
                width: {
                    type: GraphQLInt,
                    defaultValue: 400,
                  },
                height: {
                    type: GraphQLInt,
                  },
                quality: {
                    type: GraphQLInt,
                    defaultValue: 50,
                  },
                grayscale: {
                    type: GraphQLBoolean,
                    defaultValue: false,
                  },
                base64: {
                    type: GraphQLBoolean,
                    defaultValue: false,
                  },
              },
              resolve (file, args) {
                return new Promise(resolve => {
                    md5File(file.SourceFile, (err, hash) => {
                      const imgSrc = `/images/${hash}-${qs.stringify(
                        args
                      )}.${file.FileTypeExtension}`
                      const filePath = `${process.cwd()}/public${imgSrc}`
                      let transformer = sharp(file.SourceFile)
                        .resize(args.width, args.height)
                        .quality(args.quality)
                        .progressive()

                      // grayscale
                      if (args.grayscale) {
                        transformer = transformer.grayscale()
                      }

                      // rotate
                      if (args.rotate) {
                        transformer = transformer.rotate(args.rotate)
                      } else {
                        // Rotate according to the EXIF Orientation tag.
                        transformer = transformer.rotate()
                      }

                      if (args.base64) {
                        transformer.toBuffer((err, data) => {
                          resolve({
                            src: data.toString(`base64`),
                            width: args.width,
                          })
                        })
                      } else {
                        transformer.toFile(filePath).then(metadata => {
                          metadata.src = imgSrc
                          resolve(metadata)
                        })
                      }
                    })
                  })
              },
            },
          },
        })

        const { connectionType: imageConnection } = connectionDefinitions({
          nodeType: ImageType,
          connectionFields: () => ({
            totalCount: {
              type: GraphQLInt,
            },
          }),
        })

        return resolve({
          image: {
            type: ImageType,
            args: {
              path: {
                type: new GraphQLNonNull(GraphQLString),
                description: `URL path to image`,
              },
            },
            resolve (root, args) {
              return _.find(mappedResults, page => page.path === args.path)
            },
          },
          allImages: {
            type: imageConnection,
            description: `Images`,
            args: {
              ...connectionArgs,
            },
            resolve (something, args) {
              const result = connectionFromArray(mappedResults, args)
              result.totalCount = mappedResults.length
              return result
            },
          },
        })
      })
    })
  })
})
