/* @flow weak */
import _ from 'lodash'
//import path from 'path'
//import Promise from 'bluebird'

import { siteDB } from '../utils/globals'
//import markdownSchema from './markdown'
import siteSchema from './site-schema'

//import moment from 'moment'
//import qs from 'querystring'
import {
  GraphQLSchema,
  GraphQLObjectType,
  printSchema,
  //GraphQLString,
  //GraphQLInt,
  //GraphQLID,
  //GraphQLList,
  //GraphQLBoolean,
  //GraphQLNonNull,
  //GraphQLInterfaceType,
} from 'graphql'
//import {
  //connectionFromArray,
  //connectionArgs,
  //connectionDefinitions,
  //toGlobalId,
//} from 'graphql-relay'
//import md5File from 'md5-file'
//import MarkdownIt from 'markdown-it'
//import parseFilepath from 'parse-filepath'
//import u from 'unist-builder'
//import fs from 'fs'
//import grayMatter from 'gray-matter'
//import purdy from 'purdy'
//const visit = require('unist-util-visit')
//const select = require('unist-util-select')
//import remark from 'remark'
//import remarkHtml from 'remark-html'
//import excerptHTML from 'excerpt-html'
import apiRunner from '../utils/api-runner-node'
//const parents = require(`unist-util-parents`)

//const md = new MarkdownIt({
  //html: true,
  //typographer: true,
//})

const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)

module.exports = async () => {
  console.time(`building ast`)
  const sourceAST = await apiRunner(`sourceNodes`)
  const root = { type: `root`, children: sourceAST }
  await apiRunner(`modifyAST`, { ast: root })
  console.timeEnd(`building ast`)

  console.time(`building schema`)
  let typesIntermediateRepresentation = await apiRunner(`registerGraphQLNodes`, { ast: root })
  typesIntermediateRepresentation = _.flatten(typesIntermediateRepresentation)
  // For each type, infer remaining fields, add node fields, construct type w/
  // node as its interface, and then create various connections.
  const typesGQL = _.merge(...buildNodeTypes(typesIntermediateRepresentation))
  const connections = buildNodeConnections(typesGQL, typesIntermediateRepresentation)
  console.timeEnd(`building schema`)
  //console.log({
    //...typesGQL,
    //...connections,
    //...siteSchema(),
  //})

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => ({
        ...typesGQL,
        ...connections,
        ...siteSchema(),
      }),
    }),
  })
  return schema
}

  //purdy(modifiedAST, { depth: null })
  //purdy(select(root, `File`))
  //purdy(select(root, `File[extension="js"]`))
  // TODO sourcedirectory passes files AST to its parsers
  // and then returns
  // then call next API runner for compiling to graphql schema.
  /*
  return new Promise((resolve, reject) => {
    isOpen
    .catch((err) => reject(err))
    .then(() => {
    glob(`${config.sources}/**//**`, { nodir: true }, (err, files) => {
        Promise.all(files.map((file) => ep.readMetadata(file)))
        .then((results) => {
          const cleanedResults = _.filter(results, (result) => {
            if (result.error === null) {
              return true
            } else {
              console.log('errored result', result)
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

          // Create examples of each field type.
          //const fileFields = {}
          //_.each(mappedResults, (file) => {
            //_.each(file, (v, k) => {
              //if (!fileFields[k]) {
                //fileFields[k] = v
              //}
            //})
          //})

          console.time('create ast')
          // Create Unist nodes
          const ast = u(`root`)
          console.log(ast)
          ast.children = []
          mappedResults.forEach((file) => {
            ast.children.push({
              type: `File`,
              id: toGlobalId(`File`, file.sourceFile),
              children: [],
              sourceFile: file.sourceFile,
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

          // Add Markdown children.
          ast.children.forEach((file) => {
            if (file.extension === `md`) {
              // it's markdown!
              // Load file and parse out frontmatter.
              const fileContents = fs.readFileSync(file.sourceFile, `utf-8`)
              const data = grayMatter(fileContents)
              const markdownNode = {
                type: `MarkdownRemark`,
                parent: file,
                id: toGlobalId(`MarkdownRemark`, `${file.sourceFile} >> markdown-remark`),
                children: [],
                src: data.content,
                frontmatter: data.data,
              }

              //const frontmatterNode = {
                //parent: markdownNode,
                //type: `Frontmatter`,
                //id: toGlobalId(`Frontmatter`, `${file.sourceFile} >> markdown-remark >> frontmatter`),
                //children: [],
                //data: {
                  //...data.data,
                //},
              //}

              //markdownNode.children.push(frontmatterNode)

              file.children.push(markdownNode)
            }
          })

          //purdy(ast, { depth: null })
          console.timeEnd('create ast')

          console.time('compile graphql schema')
          // Create GraphQL type for each type in ast
          const nodeTypes = new Set()
          const nodeFields = new Map()
          visit(ast, (node) => {
            nodeTypes.add(node.type)
            if (!nodeFields.has(node.type)) {
              nodeFields.set(node.type, new Map())
            }
            // Add the field names for the nodes data.
            const nonReservedFields = { ...node }
            delete nonReservedFields.id
            delete nonReservedFields.parent
            delete nonReservedFields.type
            delete nonReservedFields.children
            if (!_.isEmpty(nonReservedFields)) {
              _.each(nonReservedFields, (value, key) => {
                if (!nodeFields.get(node.type).has(key)) {
                  nodeFields.get(node.type).set(key, new Set())
                }
                nodeFields.get(node.type).get(key).add(value)
              })
            }
          })
          console.log(nodeTypes)
          console.log(nodeFields.values())
          //console.log(nodeFields.get('frontmatter').get('title'))
          // Create node interface.
          const nodeInterface = new GraphQLInterfaceType({
            name: `Node`,
            fields: () => ({
              id: {
                type: new GraphQLNonNull(GraphQLID),
                description: `The id of the node.`,
              },
              parent: {
                type: nodeInterface,
                description: `The parent of this node.`,
              },
              children: {
                type: new GraphQLList(nodeInterface),
                description: `The children of this node.`,
              },
            }),
          })

          // TODO
          // * Make rendering one layer at a time
          // * Split things out into plugins
          let graphqlTypes = Array.from(nodeTypes).map((type) => {
            console.log(type)
            if (type !== `root` && type !== `Frontmatter`) {
              const fieldsData = Array.from(nodeFields.get(type))
              const dataFields = {}
              fieldsData.forEach((field) => {
                if (field[0] != `frontmatter`) {
                  const fieldType = inferGraphQLType(Array.from(field[1])[0])
                  dataFields[_.camelCase(field[0])] = {
                    type: fieldType,
                  }
                }
              })
              let otherFields
              if (type === `MarkdownRemark`) {
                otherFields = {
                  html: {
                    type: GraphQLString,
                    resolve (markdown) {
                      return new Promise((resolve) => {
                        remark().use(remarkHtml).process(markdown.src, (err, file) => {
                          if (err) console.log(err)
                          resolve(file.contents)
                        })
                      })
                    },
                  },
                  excerpt: {
                    type: GraphQLString,
                    args: {
                      pruneLength: {
                        type: GraphQLInt,
                        defaultValue: 140,
                      },
                    },
                    resolve (markdown, { pruneLength }) {
                      return new Promise((resolve) => {
                        remark().use(remarkHtml).process(markdown.src, (err, file) => {
                          if (err) console.log(err)
                          resolve(excerptHTML(file.contents, { pruneLength }))
                        })
                      })
                    },
                  },
                }
                // Frontmatter.
                const dataFields = {}
                fieldsData.forEach((field) => {
                  if (field[0] === `frontmatter`) {
                    console.log('frontmatter field', field)
                    //const fieldType = inferGraphQLType(Array.from(field[1])[0])
                    //dataFields[_.camelCase(field[0])] = {
                      //type: fieldType,
                    //}
                  }
                })
              }

              const fields = {
                id: {
                  type: new GraphQLNonNull(GraphQLID),
                  description: `The id of this ${type} node.`,
                },
                parent: {
                  type: nodeInterface,
                  description: `The parent of this ${type} node.`,
                },
                children: {
                  type: new GraphQLList(nodeInterface),
                  description: `The children of this ${type} node.`,
                },
                ...dataFields,
                ...otherFields,
              }
              console.log(`fields for ${type}`, fields)
              return new GraphQLObjectType({
                name: type,
                fields,
                interfaces: [nodeInterface],
                isTypeOf: (value) => value.type === type,
              })
            } else {
              return null
            }
          })
          graphqlTypes = _.filter(graphqlTypes, (type) => !_.isEmpty(type))
          //purdy(graphqlTypes, { depth: null })
          //const fileType = new GraphQLObjectType({
            //name: `Files`,
            //fields,
          //})
          //
          // TODO make a gatsby-graphql helper package
          // that lets you pass in a node type and array of items
          // and it'll construct various connections w/ args.

          // Create a connection for each node type.
          const connectionTypes = {}
          graphqlTypes.forEach((type) => {
            const { connectionType: typeConnection } =
              connectionDefinitions(
                {
                  nodeType: type,
                  connectionFields: () => ({
                    totalCount: {
                      type: GraphQLInt,
                    },
                  }),
                }
              )

            //purdy(typeConnection)
            //purdy(_.camelCase(`all ${type.name}`))
            connectionTypes[_.camelCase(`all ${type.name}`)] = {
              type: typeConnection,
              args: {
                ...connectionArgs,
              },
              resolve (object, args) {
                //purdy(select(ast, type.name))
                const nodes = select(ast, type.name)
                const result = connectionFromArray(
                  nodes,
                  args,
                )
                result.totalCount = nodes.length
                return result
              },
            }
          })
          console.timeEnd('compile graphql schema')
          //purdy(connectionTypes, { depth: null })
          //const { connectionType: fileConnection } =
            //connectionDefinitions(
              //{
                //nodeType: fileType,
                //connectionFields: () => ({
                  //totalCount: {
                    //type: GraphQLInt,
                  //},
                //}),
              //}
            //)

          /**
          TODO move Gatsby to Lerna, this is package, create "types" package.
          Other plugins register callback for different types e.g.  FILE
          response to callback is fields and subtype(s) and additional types
          e.g. markdown lists HTML type. When you list a type, must pass back
          array of its objects w/ required fields met e.g. HTML: [ { src:
          '<HTML />' }] so a markdown plugin would listen for files and scan
          files for markdown files and then parse these, create JSON type for
          frontmatter, and return the array of objects as specific to plugin
          REMARK_MARKDOWN with community JSON & HTML as subtypes.  When
          inferring JSON field types, check if field pointing to file by
          checking the original path of the file (if there is an original
          file).  Then see if that resolves to an actual file either as
          relative path or as from root of project.

          So construct schema tree and parallal data tree. Only do work
          necessary to figure out structure i.e. don't actually create HTML
          from markdown. So markdown would specify field resolvers for HTML but
          the actual type(s) that a field would point to would depend on their
          being a HTML plugin to recognize the HTML type.

          plugins have default file extensions they look at but can be overriden
          when setting up the type. So they recognize named types or file types.
          When connecting to a file, they're just passed the file object and there's
          a helper function to load the file contents (so it's not done multiple times).

          plugins can specify field names for sub-types e.g. markdown->frontmatter but in case
          of there being two or more plugins that create subobjects for that subtype,
          the name gets postfixed with name of plugin e.g. for markdown could have
          file->markdownREMARK and file->markdownMARKDOWNIT

          or maybe... not? What about components that export queries? Though...
          those queries *should* be mixed in (or whatever the name is) only at
          the subtype level e.g. image or perhaps even markdown but in case of
          markdown, different plugins should reuse the same field names.

          How to test this? Ideally could skip globbing for most tests just
          pass in array of file objects.

          plugins provide raw src field(s) and type to be consumed by next step.

          just add dateFormat(FORMAT_STRING, DATE_PATTERN(optional)) to all strings?

          Track every file that a query touches + type of file/range that a query on
          a connection touches. When a file changes, invalidate queries and re-run.

          Have client post to dev server when it changes pages. Backend tracks
          this and whenever queries are re-run (whether the query or file is
          changed), it runs the query for the active page first. Smart enough
          to interrupt running queries to put a new change first.

          Really need to have hot reloading of new pages. Client should reload
          routes table forcably when the actual routes change.

          const schema = new GraphQLSchema({
            query: new GraphQLObjectType({
              name: `RootQueryType`,
              fields: () => ({
                ...connectionTypes,
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
                test: {
                  type: GraphQLString,
                  description: "This is just a test field yo",
                  resolve () { return "hi" },
                },
              }),
            }),
          })

          resolve(schema)
        })
      })
    })
  })
}
*/
