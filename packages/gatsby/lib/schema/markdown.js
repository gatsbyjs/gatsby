import parseFilepath from "parse-filepath"
import Promise from "bluebird"
import remarkAbstract from "remark"
import sanitizeHTML from "sanitize-html"
import excerptHTML from "excerpt-html"
import remarkHtmlAbstract from "remark-html"
import glob from "glob"
import _ from "lodash"
import fs from "fs"
import select from "unist-util-select"
import moment from "moment"
import yaml from "yaml-js"
import path from "path"
import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} from "graphql"

import {
  connectionFromArray,
  connectionArgs,
  connectionDefinitions,
} from "graphql-relay"

import inferGraphQLType from "./infer-graphql-type"
import { nodeInterface } from "./node"
import createPath from "../bootstrap/create-path"

// Setup Markdown parsing.
const remark = remarkAbstract({ commonmark: true })
const thing = {}
remarkHtmlAbstract(thing)

module.exports = directory =>
  new Promise((resolve, reject) => {
    let pages = []
    glob(`${directory}/**/*.md`, (err, files) => {
      if (err) return reject(err)
      _.each(files, file => {
        const page = {}
        page.src = fs.readFileSync(file, `utf-8`)
        const ast = remark.parse(page.src)
        page.ast = ast
        page.bodyHTML = thing.Compiler.prototype.compile(page.ast)
        page.headings = select(ast, `heading`).map(heading => ({
          value: _.first(select(heading, `text`).map(text => text.value)),
          depth: heading.depth,
        }))
        const parsedFrontmatter = _.first(
          select(ast, `yaml`).map(heading => yaml.load(heading.value))
        )
        const relativeDirectory = parseFilepath(
          path.relative(`${directory}/pages/`, file)
        ).dirname

        // Create path.
        let filePath
        if (_.includes(relativeDirectory, `---`)) {
          // This is for my blog bricolage.io. This will be moved out soonish.
          filePath = `/${relativeDirectory.split(`---`)[1]}/`
        } else {
          filePath = createPath(path.join(directory, `pages`), file)
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
      pages = _.sortBy(pages, page => page.frontmatter.date).reverse()

      // TODO add numberOfWords field
      const markdownType = new GraphQLObjectType({
        name: `Markdown`,
        fields: () => ({
          id: {
            type: new GraphQLNonNull(GraphQLID),
          },
          path: {
            type: GraphQLString,
          },
          frontmatter: {
            type: new GraphQLObjectType({
              name: `Frontmatter`,
              fields: frontmatterFields(),
            }),
          },
          headings: {
            type: new GraphQLList(HeadingType),
            resolve(page) {
              return page.headings
            },
          },
          bodyMarkdown: {
            type: GraphQLString,
            resolve(page) {
              return page.src
            },
          },
          bodyHTML: {
            type: GraphQLString,
            resolve(page) {
              return page.bodyHTML
            },
          },
          timeToRead: {
            type: GraphQLInt,
            resolve(page) {
              let timeToRead = 0
              const pureText = sanitizeHTML(page.bodyHTML, { allowTags: [] })
              const avgWPM = 265
              const wordCount = _.words(pureText).length
              timeToRead = Math.round(wordCount / avgWPM)
              if (timeToRead === 0) {
                timeToRead = 1
              }
              return timeToRead
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
            },
          },
        }),
        interfaces: [nodeInterface],
      })

      const frontmatterFields = () => {
        // Create object with the first example of every frontmatter key.
        const frontmatterFieldExamples = {}
        _.each(pages, page => {
          _.each(page.frontmatter, (v, k) => {
            if (!frontmatterFieldExamples[k]) {
              frontmatterFieldExamples[k] = v
            }
          })
        })

        const fields = {}
        // TODO make this work with sub-objects.
        _.each(frontmatterFieldExamples, (v, k) => {
          const type = inferGraphQLType(k, v)
          if (type === `DATE`) {
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
              },
            }
          } else {
            fields[k] = { type: inferGraphQLType(k, v) }
          }
        })

        if (fields.readNext) {
          fields.readNext = {
            type: markdownType,
            resolve(frontmatter) {
              return _.find(pages, page => page.path === frontmatter.readNext)
            },
          }
        }

        return fields
      }

      const HeadingType = new GraphQLObjectType({
        name: `Heading`,
        fields: {
          value: {
            type: GraphQLString,
            resolve(heading) {
              return heading.value
            },
          },
          depth: {
            type: GraphQLInt,
            resolve(heading) {
              return heading.depth
            },
          },
        },
      })

      const { connectionType: markdownConnection } = connectionDefinitions({
        nodeType: markdownType,
        connectionFields: () => ({
          totalCount: {
            type: GraphQLInt,
          },
        }),
      })

      const markdownTypes = {
        allMarkdown: {
          type: markdownConnection,
          description: `All markdown files`,
          args: {
            ...connectionArgs,
            tag: {
              type: GraphQLString,
              description: `Filter by posts that have this tag`,
            },
          },
          resolve(markdown, args) {
            let filteredPages
            // Specifc for my blog bricolage.io. Will be adding
            // general filtering feature soonish.
            if (args.tag) {
              filteredPages = _.filter(pages, page => {
                if (!page.frontmatter.tags) {
                  return false
                } else {
                  return _.includes(
                    page.frontmatter.tags.map(tag => tag.toLowerCase()),
                    args.tag.toLowerCase()
                  )
                }
              })
            } else {
              filteredPages = _.clone(pages)
            }
            const result = connectionFromArray(filteredPages, args)
            result.totalCount = filteredPages.length
            return result
          },
        },
        markdown: {
          type: markdownType,
          args: {
            path: {
              type: new GraphQLNonNull(GraphQLString),
              description: `URL path to markdown page`,
            },
          },
          resolve(root, args) {
            return _.find(pages, page => page.path === args.path)
          },
        },
      }
      return resolve(markdownTypes)
    })
  })
