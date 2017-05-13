const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
} = require(`graphql`)
const Remark = require(`remark`)
const select = require(`unist-util-select`)
const sanitizeHTML = require(`sanitize-html`)
const _ = require(`lodash`)
const visit = require(`unist-util-visit`)
const toHAST = require(`mdast-util-to-hast`)
const hastToHTML = require(`hast-util-to-html`)
const Promise = require(`bluebird`)
const prune = require(`underscore.string/prune`)

let pluginsCacheStr = ``
const astCacheKey = node => {
  return `transformer-remark-markdown-ast-${node.internal.contentDigest}-${pluginsCacheStr}`
}
const htmlCacheKey = node => {
  return `transformer-remark-markdown-html-${node.internal.contentDigest}-${pluginsCacheStr}`
}
const headingsCacheKey = node => {
  return `transformer-remark-markdown-headings-${node.internal.contentDigest}-${pluginsCacheStr}`
}

module.exports = (
  { type, allNodes, linkPrefix, getNode, cache },
  pluginOptions
) => {
  if (type.name !== `MarkdownRemark`) {
    return {}
  }

  pluginsCacheStr = pluginOptions.plugins.map(p => p.name).join(``)

  return new Promise((resolve, reject) => {
    const files = allNodes.filter(n => n.type === `File`)

    // Setup Remark.
    const remark = new Remark({
      commonmark: true,
      footnotes: true,
      pedantic: true,
    })

    async function getAST(markdownNode) {
      const cachedAST = await cache.get(astCacheKey(markdownNode))
      if (cachedAST) {
        return cachedAST
      } else {
        const ast = await new Promise((resolve, reject) => {
          Promise.all(
            pluginOptions.plugins.map(plugin => {
              const requiredPlugin = require(plugin.resolve)
              if (_.isFunction(requiredPlugin.mutateSource)) {
                console.log(`running plugin to mutate markdown source`)
                return requiredPlugin.mutateSource({
                  markdownNode,
                  files,
                  getNode,
                  pluginOptions: plugin.pluginOptions,
                })
              } else {
                return Promise.resolve()
              }
            })
          ).then(() => {
            const markdownAST = remark.parse(markdownNode.internal.content)

            // source => parse (can order parsing for dependencies) => typegen
            //
            // source plugins identify nodes, provide id, initial parse, know
            // when nodes are created/removed/deleted
            // get passed cached DataTree and return list of clean and dirty nodes.
            // Also get passed `dirtyNodes` function which they can call with an array
            // of node ids which will then get re-parsed and the inferred schema
            // recreated (if inferring schema gets too expensive, can also
            // cache the schema until a query fails at which point recreate the
            // schema).
            //
            // parse plugins take data from source nodes and extend it, never mutate
            // it. Freeze all nodes once done so typegen plugins can't change it
            // this lets us save off the DataTree at that point as well as create
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
            // every node type in DataTree gets a schema type automatically.
            // typegen plugins just modify the auto-generated types to add derived fields
            // as well as computationally expensive fields.
            Promise.all(
              pluginOptions.plugins.map(plugin => {
                const requiredPlugin = require(plugin.resolve)
                if (_.isFunction(requiredPlugin)) {
                  return requiredPlugin({
                    markdownAST,
                    markdownNode,
                    getNode,
                    files,
                    pluginOptions: plugin.pluginOptions,
                    linkPrefix,
                  })
                } else {
                  return Promise.resolve()
                }
              })
            ).then(() => {
              resolve(markdownAST)
            })
          })
        })

        // Save new AST to cache and return
        cache.set(astCacheKey(markdownNode), ast)
        return ast
      }
    }

    async function getHeadings(markdownNode) {
      const cachedHeadings = await cache.get(headingsCacheKey(markdownNode))
      if (cachedHeadings) {
        return cachedHeadings
      } else {
        const ast = await getAST(markdownNode)
        const headings = select(ast, `heading`).map(heading => ({
          value: _.first(select(heading, `text`).map(text => text.value)),
          depth: heading.depth,
        }))

        cache.set(headingsCacheKey(markdownNode), headings)
        return headings
      }
    }

    async function getHTML(markdownNode) {
      const cachedHTML = await cache.get(htmlCacheKey(markdownNode))
      if (cachedHTML) {
        return cachedHTML
      } else {
        const html = await new Promise((resolve, reject) => {
          getAST(markdownNode).then(ast => {
            resolve(
              hastToHTML(toHAST(ast, { allowDangerousHTML: true }), {
                allowDangerousHTML: true,
              })
            )
          })
        })

        // Save new HTML to cache and return
        cache.set(htmlCacheKey(markdownNode), html)
        return html
      }
    }

    const HeadingType = new GraphQLObjectType({
      name: `MarkdownHeading`,
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

    const HeadingLevels = new GraphQLEnumType({
      name: `HeadingLevels`,
      values: {
        h1: { value: 1 },
        h2: { value: 2 },
        h3: { value: 3 },
        h4: { value: 4 },
        h5: { value: 5 },
        h6: { value: 6 },
      },
    })

    return resolve({
      html: {
        type: GraphQLString,
        resolve(markdownNode) {
          return getHTML(markdownNode)
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
        resolve(markdownNode, { pruneLength }) {
          return getAST(markdownNode).then(ast => {
            const textNodes = []
            visit(ast, `text`, textNode => textNodes.push(textNode.value))
            return prune(textNodes.join(` `), pruneLength)
          })
        },
      },
      headings: {
        type: new GraphQLList(HeadingType),
        args: {
          depth: {
            type: HeadingLevels,
          },
        },
        resolve(markdownNode, { depth }) {
          return getHeadings(markdownNode).then(headings => {
            if (typeof depth === `number`) {
              headings = headings.filter(heading => heading.depth === depth)
            }
            return headings
          })
        },
      },
      timeToRead: {
        type: GraphQLInt,
        resolve(markdownNode) {
          return getHTML(markdownNode).then(html => {
            let timeToRead = 0
            const pureText = sanitizeHTML(html, { allowTags: [] })
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
}
