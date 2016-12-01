const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const {
  connectionFromArray,
  connectionArgs,
  connectionDefinitions,
} = require(`graphql-relay`)
const Remark = require(`remark`)
const remarkHtml = require(`remark-html`)
const excerptHTML = require(`excerpt-html`)
const select = require(`unist-util-select`)
const sanitizeHTML = require(`sanitize-html`)
const _ = require(`lodash`)

const { nodeInterface } = require(`../gatsby-graphql-utils`)

exports.registerGraphQLNodes = ({ args }) => {
  // Setup Remark.
  const remark = Remark({ commonmark: true })
  const htmlCompiler = {}
  remarkHtml(htmlCompiler)

  const { ast } = args
  const nodes = select(ast, `Markdown`)

  const getAST = (markdownNode) => {
    if (markdownNode.ast) {
      return markdownNode
    } else {
      markdownNode.ast = remark.parse(markdownNode.src)
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
}
