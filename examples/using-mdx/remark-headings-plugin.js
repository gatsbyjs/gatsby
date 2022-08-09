const visit = require(`unist-util-visit`)
const toString = require(`mdast-util-to-string`)

exports.remarkHeadingsPlugin = function remarkHeadingsPlugin() {
  return async function transformer(tree, file) {
    let headings = []

    visit(tree, `heading`, heading => {
      headings.push({
        value: toString(heading),
        depth: heading.depth,
      })
    })

    const mdxFile = file
    if (!mdxFile.data.meta) {
      mdxFile.data.meta = {}
    }

    mdxFile.data.meta.headings = headings
  }
}
