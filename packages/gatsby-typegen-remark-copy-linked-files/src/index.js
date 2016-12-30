const visit = require(`unist-util-visit`)
const isRelativeUrl = require(`is-relative-url`)
const fsExtra = require(`fs-extra`)
const path = require(`path`)
const parseFilepath = require(`parse-filepath`)
const _ = require(`lodash`)

module.exports = ({ files, markdownNode, markdownAST }) => {
  // Copy linked files to the public directory and modify the AST to point to
  // new location of the files.
  visit(markdownAST, `link`, (link) => {
    if (isRelativeUrl(link.url)) {
      const linkPath = path.join(markdownNode.parent.dirname, link.url)
      const linkNode = _.find(files, (file) => {
        if (file && file.sourceFile) {
          return file.sourceFile === linkPath
        }
        return null
      })
      if (linkNode && linkNode.sourceFile) {
        const newPath = path.join(process.cwd(), `public`, `${linkNode.hash}.${linkNode.extension}`)
        const relativePath = path.join(`/${linkNode.hash}.${linkNode.extension}`)
        link.url = `${relativePath}`
        if (!fsExtra.existsSync(newPath)) {
          fsExtra.copy(linkPath, newPath, (err) => {
            if (err) { console.error(`error copying file`, err) }
          })
        }
      }
    }
  })
}
