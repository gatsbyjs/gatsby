const select = require("unist-util-select")
const Promise = require("bluebird")
const fs = require("fs")
const grayMatter = require("gray-matter")
const _ = require("lodash")

const { loadNodeContents } = require("gatsby-source-filesystem")

async function mutateDataNode({ node }) {
  // List of markdown extensions taken from
  // https://github.com/github/markup/blob/cf74e842dfd082d8001417c1bb94edd2ae06d61b/lib/github/markup/markdown.rb#L28
  const extensions = [
    "md",
    "rmd",
    "mkd",
    "mkdn",
    "mdwn",
    "mdown",
    "litcoffee",
    "markdown",
  ]
  if (!_.includes(extensions, node.extension)) {
    return
  }

  const content = await loadNodeContents(node)
  const data = grayMatter(content)
  const markdownNode = {
    _sourceNodeId: node.id,
    type: `MarkdownRemark`,
    id: `${node.id} >> MarkdownRemark`,
    children: [],
    src: data.content,
  }
  markdownNode.frontmatter = {
    _sourceNodeId: node.id,
    ...data.data,
  }

  node.children.push(markdownNode)
}

exports.mutateDataNode = mutateDataNode
