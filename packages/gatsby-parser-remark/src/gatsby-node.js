const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const grayMatter = require(`gray-matter`)

exports.modifyAST = ({ args }) => (
  new Promise((resolve) => {
    console.time(`parse markdown file`)
    const { ast } = args
    // List of markdown extensions taken from
    // https://github.com/github/markup/blob/cf74e842dfd082d8001417c1bb94edd2ae06d61b/lib/github/markup/markdown.rb#L28
    const files = select(ast, `
      File[extension="md"],
      File[extension="rmd"],
      File[extension="mkd"],
      File[extension="mkdn"],
      File[extension="mdwn"],
      File[extension="mdown"],
      File[extension="litcoffee"],
      File[extension="markdown"]
    `)
    files.forEach((file) => {
      const fileContents = fs.readFileSync(file.sourceFile, `utf-8`)
      const data = grayMatter(fileContents)
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
    return resolve(ast)
  })
)
