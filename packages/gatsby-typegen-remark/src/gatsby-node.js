const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const Remark = require(`remark`)
const remarkHtml = require(`remark-html`)
const excerptHTML = require(`excerpt-html`)
const select = require(`unist-util-select`)
const sanitizeHTML = require(`sanitize-html`)
const _ = require(`lodash`)
const path = require(`path`)
const fs = require(`fs`)
const fsExtra = require(`fs-extra`)
const isRelativeUrl = require(`is-relative-url`)
const parseFilepath = require(`parse-filepath`)

const { nodeInterface } = require(`../gatsby-graphql-utils`)

exports.registerGraphQLNodes = ({ args }) => {
  // Setup Remark.
  const remark = Remark({ commonmark: true })
  const htmlCompiler = {}
  remarkHtml(htmlCompiler)

  const { ast, programDB } = args
  const nodes = select(ast, `Markdown`)

  const getAST = (markdownNode) => {
    if (markdownNode.ast) {
      return markdownNode
    } else {
      const markdownAST = remark.parse(markdownNode.src)

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
          const linkNode = select(ast, `File[sourceFile=${linkPath}]`)[0]
          if (linkNode.sourceFile) {
            const newPath = path.join(programDB().directory, `public`, `${linkNode.hash}.${linkNode.extension}`)
            const relativePath = path.join(`/${linkNode.hash}.${linkNode.extension}`)
            link.url = `${relativePath}`
            if (!fs.existsSync(newPath)) {
              fsExtra.copy(linkPath, newPath, (err) => {
                if (err) { console.error(`error copying file`, err) }
              })
            }
          }
        }
      })
      const images = select(markdownAST, 'image')
      if (images.length > 0) {
        images.forEach((image) => {
          const imagePath = path.join(markdownNode.parent.dirname, image.url)
          const imageNode = select(ast, `File[sourceFile=${imagePath}]`)[0]
          if (imageNode.sourceFile) {
            const newPath = path.join(programDB().directory, `public`, `${imageNode.hash}.${imageNode.extension}`)
            const relativePath = path.join(`${imageNode.hash}.${imageNode.extension}`)
            image.url = `/${relativePath}`
            if (!fs.existsSync(newPath)) {
              fsExtra.copy(imagePath, newPath, (err) => {
                if (err) { console.error(`error copying file`, err) }
              })
            }
          }
        })
      }
      markdownNode.ast = markdownAST
      return markdownNode
    }
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
      markdownNode.html = htmlCompiler.Compiler.prototype.compile(getAST(markdownNode).ast)
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

  const fields = {
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

  return [
    {
      type: `Markdown`,
      name: `MarkdownRemark`,
      fields,
      nodes,
    },
  ]
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
}
