const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const grayMatter = require(`gray-matter`)

const { loadNodeContents } = require(`gatsby-source-filesystem`)

async function modifyAST ({ args }) {
  console.time(`parse markdown file`)
  const { ast } = args
  // List of markdown extensions taken from
  // https://github.com/github/markup/blob/cf74e842dfd082d8001417c1bb94edd2ae06d61b/lib/github/markup/markdown.rb#L28
  const files = select(
    ast,
    `
    File[extension="md"],
    File[extension="rmd"],
    File[extension="mkd"],
    File[extension="mkdn"],
    File[extension="mdwn"],
    File[extension="mdown"],
    File[extension="litcoffee"],
    File[extension="markdown"]
  `,
  )
  const contents = await Promise.map(files, file => loadNodeContents(file))
  files.forEach((file, index) => {
    const data = grayMatter(contents[index])
    const markdownNode = {
      _sourceNodeId: file.id,
      type: `MarkdownRemark`,
      id: `${file.id} >> MarkdownRemark`,
      children: [],
      src: data.content,
    }
    markdownNode.frontmatter = {
      _sourceNodeId: file.id,
      ...data.data,
    }

    file.children.push(markdownNode)
  })
  console.timeEnd(`parse markdown file`)
  return ast
}

exports.modifyAST = modifyAST
