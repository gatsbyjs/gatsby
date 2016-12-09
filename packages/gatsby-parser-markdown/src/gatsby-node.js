const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const { toGlobalId } = require(`graphql-relay`)
const grayMatter = require(`gray-matter`)

exports.modifyAST = ({ args }) => {
  return new Promise((resolve) => {
    const { ast } = args
    const files = select(ast, `File[extension="md"], File[extension="markdown"]`)
    console.time(`parse markdown file`)
    files.forEach((file) => {
      const fileContents = fs.readFileSync(file.sourceFile, `utf-8`)
      const data = grayMatter(fileContents)
      const markdownNode = {
        _sourceNodeId: file.id,
        type: `Markdown`,
        id: toGlobalId(`Markdown`, `${file.sourceFile} >> markdown`),
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
}
