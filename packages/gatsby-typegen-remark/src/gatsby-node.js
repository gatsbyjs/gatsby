const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const Remark = require(`remark`)
const select = require(`unist-util-select`)
const sanitizeHTML = require(`sanitize-html`)
const _ = require(`lodash`)
const path = require(`path`)
const fs = require(`fs`)
const fsExtra = require(`fs-extra`)
const querystring = require(`querystring`)
const visit = require(`unist-util-visit`)
const Prism = require(`prismjs`)
require(`prismjs/components/prism-go`)
const toHAST = require(`mdast-util-to-hast`)
const hastToHTML = require(`hast-util-to-html`)
const inspect = require(`unist-util-inspect`)
const Promise = require(`bluebird`)
const prune = require(`underscore.string/prune`)

exports.extendNodeType = ({ args, pluginOptions }) => new Promise((
  resolve,
  reject,
) => {
  const { ast, type, linkPrefix } = args
  if (type.name !== `MarkdownRemark`) {
    return resolve({})
  }

  const files = select(ast, `File`)

  // Setup Remark.
  const remark = new Remark({
    commonmark: true,
    footnotes: true,
    pedantic: true,
  })

  const astPromiseCache = {}
  async function getAST (markdownNode) {
    if (astPromiseCache[markdownNode.id]) {
      return astPromiseCache[markdownNode.id]
    } else {
      astPromiseCache[markdownNode.id] = new Promise((resolve, reject) => {
        Promise.all(
          pluginOptions.plugins.map(plugin => {
            const requiredPlugin = require(plugin.resolve)
            if (_.isFunction(requiredPlugin.mutateSource)) {
              console.log(`running plugin to mutate markdown source`)
              return requiredPlugin.mutateSource({
                markdownNode,
                files,
                pluginOptions: plugin.pluginOptions,
              })
            } else {
              return Promise.resolve()
            }
          }),
        ).then(() => {
          const markdownAST = remark.parse(markdownNode.src)

          // source => parse (can order parsing for dependencies) => typegen
          //
          // source plugins identify nodes, provide id, initial parse, know
          // when nodes are created/removed/deleted
          // get passed cached AST and return list of clean and dirty nodes.
          // Also get passed `dirtyNodes` function which they can call with an array
          // of node ids which will then get re-parsed and the inferred schema
          // recreated (if inferring schema gets too expensive, can also
          // cache the schema until a query fails at which point recreate the
          // schema).
          //
          // parse plugins take data from source nodes and extend it, never mutate
          // it. Freeze all nodes once done so typegen plugins can't change it
          // this lets us save off the AST at that point as well as create
          // indexes.
          //
          // typegen plugins identify further types of data that should be lazily
          // computed due to their expense, or are hard to infer graphql type
          // (markdown ast), or are need user input in order to derive e.g.
          // markdown headers or date fields.
          //
          // wrap all resolve functions to (a) auto-memoize and (b) cache to disk any
          // resolve function that takes longer than ~10ms (do research on this
          // e.g. how long reading/writing to cache takes), and (c) track which
          // queries are based on which source nodes. Also if connection of what
          // which are always rerun if their underlying nodes change..
          //
          // every node type in AST gets a schema type automatically.
          // typegen plugins just modify the auto-generated types to add derived fields
          // as well as computationally expensive fields.

          // Use PrismJS to add syntax highlighting to code blocks.
          // TODO move this to its own plugin w/ peerDependency to this.
          // this should parse ast. everything it puts on markdown nodes
          // should be namespaced with remark_
          // stage 0 — source nodes
          // stage 1 — generic parse, identify types
          // stage 2 — dive deeper — remark
          // stage 3 — work on sub-asts e.g. markdown
          // stage 4 — compile to graphql types.
          // how to order work? Stages? People will get confused about what stage to
          // use...
          // explicitly mark dependecies — e.g. remark has plugins to parse its AST
          // which remark controls when these run.
          Promise.all(
            pluginOptions.plugins.map(plugin => {
              const requiredPlugin = require(plugin.resolve)
              if (_.isFunction(requiredPlugin)) {
                return requiredPlugin({
                  markdownAST,
                  markdownNode,
                  files,
                  pluginOptions: plugin.pluginOptions,
                  linkPrefix,
                })
              } else {
                return Promise.resolve()
              }
            }),
          ).then(() => {
            markdownNode.ast = markdownAST
            resolve(markdownNode)
          })
        })
      })
    }

    return astPromiseCache[markdownNode.id]
  }

  async function getHeadings (markdownNode) {
    if (markdownNode.headings) {
      return markdownNode
    } else {
      const { ast } = await getAST(markdownNode)
      markdownNode.headings = select(ast, `heading`).map(heading => ({
        value: _.first(select(heading, `text`).map(text => text.value)),
        depth: heading.depth,
      }))

      return markdownNode
    }
  }

  const htmlPromisesCache = {}
  async function getHTML (markdownNode) {
    if (htmlPromisesCache[markdownNode.id]) {
      return htmlPromisesCache[markdownNode.id]
    } else {
      htmlPromisesCache[markdownNode.id] = new Promise((resolve, reject) => {
        getAST(markdownNode).then(node => {
          node.html = hastToHTML(
            toHAST(node.ast, { allowDangerousHTML: true }),
            { allowDangerousHTML: true },
          )
          return resolve(node)
        })
      })
      return htmlPromisesCache[markdownNode.id]
    }
  }

  const HeadingType = new GraphQLObjectType({
    name: `MarkdownHeading`,
    fields: {
      value: {
        type: GraphQLString,
        resolve (heading) {
          return heading.value
        },
      },
      depth: {
        type: GraphQLInt,
        resolve (heading) {
          return heading.depth
        },
      },
    },
  })

  return resolve({
    html: {
      type: GraphQLString,
      resolve (markdownNode) {
        return getHTML(markdownNode).then(node => node.html)
      },
    },
    src: {
      type: GraphQLString,
    },
    excerpt: {
      type: GraphQLString,
      args: {
        pruneLength: {
          type: GraphQLInt,
          defaultValue: 140,
        },
      },
      resolve (markdownNode, { pruneLength }) {
        return getAST(markdownNode).then(node => {
          const textNodes = []
          visit(node.ast, `text`, textNode => textNodes.push(textNode.value))
          return prune(textNodes.join(` `), pruneLength)
        })
      },
    },
    headings: {
      type: new GraphQLList(HeadingType),
      resolve (markdownNode) {
        return getHeadings(markdownNode).then(node => node.headings)
      },
    },
    timeToRead: {
      type: GraphQLInt,
      resolve (markdownNode) {
        return getHTML(markdownNode).then(node => {
          let timeToRead = 0
          const pureText = sanitizeHTML(node.html, { allowTags: [] })
          const avgWPM = 265
          const wordCount = _.words(pureText).length
          timeToRead = Math.round(wordCount / avgWPM)
          if (timeToRead === 0) {
            timeToRead = 1
          }
          return timeToRead
        })
      },
    },
  })
})
