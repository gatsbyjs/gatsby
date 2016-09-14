import glob from 'glob'
import _ from 'lodash'
import fs from 'fs'
import select from 'unist-util-select'
import yaml from 'yaml-js'
import remarkAbstract from 'remark'
const remark = remarkAbstract({commonmark: true})
import remarkHtmlAbstract from 'remark-html'
const thing = {}
const toHTML = new remarkHtmlAbstract(thing)
import moment from 'moment'
import sanitizeHTML from 'sanitize-html'
import excerptHTML from 'excerpt-html'
import path from 'path'
import parseFilepath from 'parse-filepath'
import Promise from 'bluebird'

import { pagesDB, siteDB } from '../utils/globals'
import createPath from './createPath'

import {
  graphql,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} from 'graphql';

import {
  nodeDefinitions,
  globalIdField,
  fromGlobalId
} from 'graphql-relay';

import {
  connectionFromArray
} from 'graphql-relay';

import {
  connectionArgs,
  connectionDefinitions
} from 'graphql-relay';

let markdown = []
const bootSchema = (directory) => {
  return new Promise((resolve, reject) => {
    console.log('directory to glob', `${directory}/pages/**/*.md`)
    let pages = []
    glob(`${directory}/pages/**/*.md`, (err, files) => {
      _.each(files, (file) => {
        const page = {}
        page.src = fs.readFileSync(file, 'utf-8')
        const ast = remark.parse(page.src)
        page.ast = ast
        page.bodyHTML = thing.Compiler.prototype.compile(page.ast)
        page.headings = select(ast, 'heading').map((heading) => {
          return {
            value: _.first(select(heading, 'text').map((text) => text.value)),
            depth: heading.depth,
          }
        })
        const parsedFrontmatter = _.first(select(ast, 'yaml').map((heading) => yaml.load(heading.value)))
        const relativeDirectory = parseFilepath(path.relative(`${directory}/pages/`, file)).dirname

        // Create path.
        let filePath
        if (_.includes(relativeDirectory, '---')) {
          // This is for my blog bricolage.io. This will be moved out soonish.
          filePath = `/${relativeDirectory.split('---')[1]}/`
        } else {
          filePath = createPath(path.join(directory, 'pages'), file)
        }
        // TODO put linkPrefix in gatsby.config.js and somehow get certain
        // context stuff into gatsby-helpers.js
        // TODO post issue for why manifest paths wrong
        // TODO post stackoverflow about how to get static values — ping Joe.
        // Prefix stuff — just store this as another key "prefixedPath"?
        pages.push({
          id: path.relative(directory, path.resolve(file)),
          path: filePath,
          ...page,
          frontmatter: {
            path: filePath,
            ...parsedFrontmatter,
          },
        })
      })
      pages = _.sortBy(pages, (page) => page.frontmatter.date).reverse()
      console.log('finishing loading files')
      return resolve(pages)
    })
  })
}

const main = (directory) => {
  const config = siteDB().get('config')

  return new Promise((resolve, reject) => {
    bootSchema(directory)
    .catch((error) => console.log('error in booting schema', error))
    .then((pages) => {
      /**
       * Using our shorthand to describe type systems, the type system for our
       * example will be the followng:
       *
       * interface Node {
       *   id: ID!
       * }
       */

      /**
       * We get the node interface and field from the relay library.
       *
       * The first method is the way we resolve an ID to its object. The second is the
       * way we resolve an object that implements node to its type.
       */
      const {nodeInterface, nodeField} = nodeDefinitions(
        (globalId) => {
          const {type, id} = fromGlobalId(globalId);
          if (type === 'Faction') {
            return getFaction(id);
          } else if (type === 'Ship') {
            return getShip(id);
          } else {
            return null;
          }
        },
        (obj) => {
          return obj.ships ? factionType : shipType;
        }
      );

      /**
       * We define our basic ship type.
       *
       * This implements the following type system shorthand:
       *   type Ship : Node {
       *     id: String!
       *     name: String
       *   }
       */
      var shipType = new GraphQLObjectType({
        name: 'Ship',
        description: 'A ship in the Star Wars saga',
        fields: () => ({
          id: globalIdField(),
          name: {
            type: GraphQLString,
            description: 'The name of the ship.',
          },
        }),
        interfaces: [nodeInterface]
      });

      /**
       * We define a connection between a faction and its ships.
       *
       * connectionType implements the following type system shorthand:
       *   type ShipConnection {
       *     edges: [ShipEdge]
       *     pageInfo: PageInfo!
       *   }
       *
       * connectionType has an edges field - a list of edgeTypes that implement the
       * following type system shorthand:
       *   type ShipEdge {
       *     cursor: String!
       *     node: Ship
       *   }
       */
      var {connectionType: shipConnection} =
        connectionDefinitions({nodeType: shipType});

      /**
       * We define our faction type, which implements the node interface.
       *
       * This implements the following type system shorthand:
       *   type Faction : Node {
       *     id: String!
       *     name: String
       *     ships: ShipConnection
       *   }
       */
      var factionType = new GraphQLObjectType({
        name: 'Faction',
        description: 'A faction in the Star Wars saga',
        fields: () => ({
          id: globalIdField(),
          name: {
            type: GraphQLString,
            description: 'The name of the faction.',
          },
          ships: {
            type: shipConnection,
            description: 'The ships used by the faction.',
            args: connectionArgs,
            resolve: (faction, args) => connectionFromArray(
              faction.ships.map((id) => getShip(id)),
              args
            ),
          }
        }),
        interfaces: [nodeInterface]
      });

      const HeadingType = new GraphQLObjectType({
        name: 'Heading',
        fields: {
          value: {
            type: GraphQLString,
            resolve(heading) {
              return heading.value
            }
          },
          depth: {
            type: GraphQLInt,
            resolve(heading) {
              return heading.depth
            }
          },
        },
      })

      const getGraphQLType = (key, value) => {
        if (Array.isArray(value)) {
          const headType = getGraphQLType('', value[0]);
          return new GraphQLList(headType)
        }

        if (value === null) {
          return null
        }

        // Check if date object.
        if (typeof value.getMonth === 'function') {
          return 'DATE'
        }

        switch(typeof value) {
          case 'boolean':
            return GraphQLBoolean
          case 'string':
            return GraphQLString
          case 'object':
            return GraphQLObjectType
          case 'number':
            return value % 1 == 0
              ? GraphQLInt
              : GraphQLFloat
        }
        return null
      }

      const metadataFields = () => {
        let fields = { empty: { type: GraphQLBoolean }}
        // TODO make this work with sub-objects.
        if (config.siteMetadata) {
          _.each(config.siteMetadata, (v, k) => {
            const type = getGraphQLType(k, v)
            if (type === 'DATE') {
              fields[k] = {
                type: GraphQLString,
                args: {
                  formatString: {
                    type: GraphQLString,
                  },
                },
                resolve (date, { formatString }) {
                  if (formatString) {
                    return moment(date).format(formatString)
                  } else {
                    return date
                  }
                }
              }
            } else {
              fields[k] = { type: getGraphQLType(k, v) }
            }
          })
        }

        return fields
      }

      const frontmatterFields = () => {
        // Create object with the first example of every frontmatter key.
        let frontmatterFieldExamples = {}
        _.each(pages, (page) => {
          _.each(page.frontmatter, (v, k) => {
            if (!frontmatterFieldExamples[k]) {
              frontmatterFieldExamples[k] = v
            }
          })
        })

        let fields = {}
        // TODO make this work with sub-objects.
        _.each(frontmatterFieldExamples, (v, k) => {
          const type = getGraphQLType(k, v)
          if (type === 'DATE') {
            fields[k] = {
              type: GraphQLString,
              args: {
                formatString: {
                  type: GraphQLString,
                },
              },
              resolve({ date }, { formatString }) {
                if (formatString) {
                  return moment(date).format(formatString)
                } else {
                  return date
                }
              }
            }
          } else {
            fields[k] = { type: getGraphQLType(k, v) }
          }
        })

        if (fields.readNext) {
          fields.readNext = {
            type: markdownType,
            resolve(frontmatter, args, context) {
              return _.find(pages, (page) => page.path === frontmatter.readNext)
            }
          }
        }

        return fields
      }

      // TODO add numberOfWords field
      const markdownType = new GraphQLObjectType({
        name: 'Markdown',
        fields: () => ({
          id: {
            type: new GraphQLNonNull(GraphQLID),
          },
          path: {
            type: GraphQLString,
          },
          frontmatter: {
            type: new GraphQLObjectType({
              name: 'Frontmatter',
              fields: frontmatterFields(),
            }),
          },
          headings: {
            type: new GraphQLList(HeadingType),
            resolve(page) {
              return page.headings
            }
          },
          bodyMarkdown: {
            type: GraphQLString,
            resolve(page) {
              return page.src
            }
          },
          bodyHTML: {
            type: GraphQLString,
            resolve(page) {
              return page.bodyHTML
            }
          },
          timeToRead: {
            type: GraphQLInt,
            resolve(page) {
              let timeToRead = 0
              const pureText = sanitizeHTML(page.bodyHTML, { allowTags: [] })
              const avgWPM = 265
              const wordCount = _.words(pureText).length
              timeToRead = Math.round(wordCount / avgWPM)
              if (timeToRead === 0) { timeToRead = 1 }
              return timeToRead
            }
          },
          excerpt: {
            type: GraphQLString,
            args: {
              pruneLength: {
                type: GraphQLInt,
                defaultValue: 140,
              },
            },
            resolve(page, { pruneLength }) {
              return excerptHTML(page.bodyHTML, {
                pruneLength,
              })
            },
          },
          readNext: {
            type: GraphQLString,
            resolve(page) {
              return page.readNext
            }
          },
        }),
        interfaces: [nodeInterface],
      })

      const pageType = new GraphQLObjectType({
        name: 'Page',
        fields: () => ({
          id: {
            type: new GraphQLNonNull(GraphQLID),
          },
          path: {
            type: GraphQLString,
          },
          component: {
            type: GraphQLString,
          },
        }),
        interfaces: [nodeInterface],
      })

      const {connectionType: markdownConnection} =
        connectionDefinitions(
          {
            nodeType: markdownType,
            connectionFields: () => ({
              totalCount: {
                type: GraphQLInt,
              },
            }),
          }
        )

      const {connectionType: pagesConnection} =
        connectionDefinitions(
          {
            nodeType: pageType,
            connectionFields: () => ({
              totalCount: {
                type: GraphQLInt,
              },
            }),
          }
        )

      const siteType = new GraphQLObjectType({
        name: 'Site',
        fields: {
          siteMetadata: {
            type: new GraphQLObjectType({
              name: 'SiteMetadata',
              fields: metadataFields(),
            }),
          },
          development: {
            type: new GraphQLObjectType({
              name: 'DevelopmentConfig',
              fields: {
                port: { type: GraphQLString },
              },
            }),
          },
          linkPrefix: {
            type: GraphQLString,
            name: 'prefixLink',
            description: 'Optionally prefix site links with this',
          },
          time: {
            type: GraphQLString,
            name: 'time',
            description: 'The current time (when you run the `gatsby` command).',
            resolve: () => new Date().toJSON(),
          },
          allPages: {
            type: pagesConnection,
            description: 'All page configuration objects',
            args: {
              ...connectionArgs,
            },
            resolve (site, args) {
              let pages = [...pagesDB.values()].map((page) => { page.id = page.path; return page })
              const result = connectionFromArray(
                pages,
                args,
              )
              result.totalCount = pages.length
              return result
            }
          }
        },
      })

      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'RootQueryType',
          fields: {
            allMarkdown: {
              type: markdownConnection,
              description: 'All markdown files',
              args: {
                ...connectionArgs,
                tag: {
                  type: GraphQLString,
                  description: 'Filter by posts that have this tag',
                },
              },
              resolve (markdown, args) {
                let filteredPages
                if (args.tag) {
                  filteredPages = _.filter(pages, (page) => {
                    if (!page.frontmatter.tags) {
                      return false
                    } else {
                      return _.includes(
                        page.frontmatter.tags.map(
                          (tag) => tag.toLowerCase()
                        ), args.tag.toLowerCase()
                      )
                    }
                  })
                } else {
                  filteredPages = _.clone(pages)
                }
                const result = connectionFromArray(
                  filteredPages,
                  args
                )
                result.totalCount = filteredPages.length
                return result
              }
            },
            markdown: {
              type: markdownType,
              args: {
                path: {
                  type: new GraphQLNonNull(GraphQLString),
                  description: 'URL path to markdown page',
                },
              },
              resolve (root, args) {
                return _.find(pages, (page) => page.path === args.path)
              },
            },
            site: {
              type: siteType,
              resolve (root, args) {
                return config
              },
            },
          },
        })
      });

      resolve(schema)
    })
  })
}

module.exports = main
