import exiftool from "node-exiftool"
import glob from "glob"
import Promise from "bluebird"
import _ from "lodash"
import moment from "moment"
import { GraphQLObjectType, GraphQLString, GraphQLInt } from "graphql"
import {
  connectionFromArray,
  connectionArgs,
  connectionDefinitions,
} from "graphql-relay"
import MarkdownIt from "markdown-it"

const md = new MarkdownIt({
  html: true,
  typographer: true,
})

//import inferGraphQLType from './infer-graphql-type'

const ep = new exiftool.ExiftoolProcess(`/usr/local/bin/exiftool`)
const isOpen = ep.open()

module.exports = directory => new Promise((resolve, reject) => {
  isOpen.catch(err => reject(err)).then(() => {
    glob(`${directory}/**/?(*.pdf)`, (err, files) => {
      Promise.all(files.map(file => ep.readMetadata(file))).then(results => {
        const cleanedResults = _.filter(
            results,
            result => result.error === null
          )
        let mappedResults = cleanedResults.map(result => result.data[0])
        mappedResults = mappedResults.map(pdf => {
          if (pdf.Description) {
            pdf.Description = md.render(
                pdf.Description.replace(/<br \/>/g, `\n`)
              )
          }
          return pdf
        })
        console.log(mappedResults[0])
          //console.log(mappedResults)
          //const mergedObject = _.merge(...mappedResults)
          //_.each(mergedObject, (v, k) => {
          //console.log(k, v)
          ////console.log(inferGraphQLType(k, v).name)
          //})
        const PdfType = new GraphQLObjectType({
          name: `Pdf`,
          fields: {
            SourceFile: { type: GraphQLString },
            FileName: { type: GraphQLString },
            FileSize: { type: GraphQLString },
            FileType: { type: GraphQLString },
            Caption: { type: GraphQLString },
            Description: { type: GraphQLString },
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
            ImgSrc: { type: GraphQLString },
          },
        })

        const { connectionType: imageConnection } = connectionDefinitions({
          nodeType: PdfType,
          connectionFields: () => ({
            totalCount: {
              type: GraphQLInt,
            },
          }),
        })

        return resolve({
          allPdfs: {
            type: imageConnection,
            description: `Pdfs`,
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
