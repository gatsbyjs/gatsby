const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const Remark = require(`remark`)
const excerptHTML = require(`excerpt-html`)
const select = require(`unist-util-select`)
const sanitizeHTML = require(`sanitize-html`)
const _ = require(`lodash`)
const path = require(`path`)
const fs = require(`fs`)
const fsExtra = require(`fs-extra`)
const isRelativeUrl = require(`is-relative-url`)
const parseFilepath = require(`parse-filepath`)
const querystring = require(`querystring`)
const visit = require(`unist-util-visit`)
const Prism = require(`prismjs`)
require(`prismjs/components/prism-go`)
const toHAST = require(`mdast-util-to-hast`)
const hastToHTML = require(`hast-util-to-html`)
const inspect = require(`unist-util-inspect`)

exports.extendNodeType = ({ args, pluginOptions }) => {
  const { ast, type } = args
  if (type.name !== `MarkdownRemark`) { return {} }

  const files = select(ast, `File`)

  // Setup Remark.
  const remark = new Remark({ commonmark: true })

  const getAST = (markdownNode) => {
    console.time(`get markdown ast`)
    if (markdownNode.ast) {
      return markdownNode
    } else {
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
      // wrap all resolve functions to a) auto-memoize and b) cache to disk any
      // resolve function that takes longer than ~10ms (do research on this
      // e.g. how long reading/writing to cache takes), and c) track which
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
      visit(markdownAST, `code`, (node) => {
        let lang
        if (Prism.languages[node.lang]) {
          lang = Prism.languages[node.lang]
          node.data = {
            hChildren: [{ type: `raw`, value: Prism.highlight(node.value, lang) }],
          }
        }
      })

      // Handle side effects — copy linked files & images to the public directory
      // and modify the AST to point to new location of the files.
      const links = select(markdownAST, `link`)
      links.forEach((link) => {
        if (isRelativeUrl(link.url) &&
            parseFilepath(link.url).extname !== `` &&
            link.url.slice(0, 6) !== `mailto` &&
            link.url.slice(0, 4) !== `data`
        ) {
          const linkPath = path.join(markdownNode.parent.dirname, link.url)
          // Perf w/ unist-util-select is horrible for the below.
          // E.g. on site w/ ~800 files, it's around ~500ms per lookup.
          //const linkNode = select(ast, `File[sourceFile=${linkPath}]`)[0]
          const linkNode = _.find(files, (file) => {
            if (file && file.sourceFile) {
              return file.sourceFile === linkPath
            } else {
              console.log(file)
            }
          })
          if (linkNode && linkNode.sourceFile) {
            //const newPath = path.join(programDB().directory, `public`, `${linkNode.hash}.${linkNode.extension}`)
            // TODO do something for production.
            link.url = `/link?${querystring.stringify({fromFile: linkNode.sourceFile})}`
            //const relativePath = path.join(`/${linkNode.hash}.${linkNode.extension}`)
            //link.url = `${relativePath}`
            //if (!fs.existsSync(newPath)) {
              //fsExtra.copy(linkPath, newPath, (err) => {
                //if (err) { console.error(`error copying file`, err) }
              //})
            //}
          } else {
            //console.log(`didn't find the file`)
            //console.log(markdownNode)
            //console.log(link)
            //console.log(linkPath)
          }
        }
      })
      const images = select(markdownAST, 'image')
      if (images.length > 0) {
        images.forEach((image) => {
          const imagePath = path.join(markdownNode.parent.dirname, image.url)
          const imageNode = _.find(files, (file) => {
            if (file && file.sourceFile) {
              return file.sourceFile === imagePath
            }
          })
          if (imageNode && imageNode.sourceFile) {
            image.url = `/image?${querystring.stringify({fromFile: imageNode.sourceFile})}`
            //const newPath = path.join(programDB().directory, `public`, `${imageNode.hash}.${imageNode.extension}`)
            //const relativePath = path.join(`${imageNode.hash}.${imageNode.extension}`)
            //image.url = `/${relativePath}`
            //if (!fs.existsSync(newPath)) {
              //fsExtra.copy(imagePath, newPath, (err) => {
                //if (err) { console.error(`error copying file`, err) }
              //})
            //}
          } else {
            //console.log(`didn't find the file`)
            //console.log(markdownNode)
            //console.log(link)
            //console.log(imagePath)
          }
        })
      }

      if (pluginOptions && _.isFunction(pluginOptions.modifyMarkdownAST)) {
        pluginOptions.modifyMarkdownAST(markdownAST)
      }
      markdownNode.ast = markdownAST
      return markdownNode
    }
    console.timeEnd(`get markdown ast`)
  }

  const getHeadings = (markdownNode) => {
    if (markdownNode.headings) {
      return markdownNode
    } else {
      const { ast } = getAST(markdownNode)
      markdownNode.headings = select(ast, `heading`).map((heading) => ({
        value: _.first(select(heading, `text`).map((text) => text.value)),
        depth: heading.depth,
      }))

      return markdownNode
    }
  }

  const getHTML = (markdownNode) => {
    if (markdownNode.html) {
      return markdownNode
    } else {
      markdownNode.html = hastToHTML(
        toHAST(
          getAST(markdownNode).ast, { allowDangerousHTML: true }
        ),
        { allowDangerousHTML: true }
      )
      return markdownNode
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

  return {
    html: {
      type: GraphQLString,
      resolve (markdownNode) {
        return getHTML(markdownNode).html
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
        return excerptHTML(getHTML(markdownNode).html, { pruneLength })
      },
    },
    headings: {
      type: new GraphQLList(HeadingType),
      resolve (markdownNode) {
        return getHeadings(markdownNode).headings
      },
    },
    timeToRead: {
      type: GraphQLInt,
      resolve (markdownNode) {
        let timeToRead = 0
        const pureText = sanitizeHTML(getHTML(markdownNode).html, { allowTags: [] })
        const avgWPM = 265
        const wordCount = _.words(pureText).length
        timeToRead = Math.round(wordCount / avgWPM)
        if (timeToRead === 0) { timeToRead = 1 }
        return timeToRead
      },
    },
  }
}
  /*
  const markdownType = new GraphQLObjectType({
    name: `MarkdownRemark`,
    fields,
    interfaces: [nodeInterface],
    isTypeOf: (value) => value.type === `Markdown`,
  })

  const { connectionType: typeConnection } =
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

  const types = {
    allMarkdown: {
      type: typeConnection,
      description: `Connection to all markdown nodes`,
      args: {
        ...connectionArgs,
      },
      resolve (object, resolveArgs) {
        const result = connectionFromArray(
          nodes,
          resolveArgs,
        )
        result.totalCount = nodes.length
        return result
      },
    },
  }

  return types
  */
//}
