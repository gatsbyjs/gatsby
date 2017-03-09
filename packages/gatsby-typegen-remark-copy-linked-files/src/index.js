const visit = require("unist-util-visit")
const isRelativeUrl = require("is-relative-url")
const fsExtra = require("fs-extra")
const path = require("path")
const _ = require("lodash")

module.exports = ({ files, markdownNode, markdownAST }) => {
  // Copy linked files to the public directory and modify the AST to point to
  // new location of the files.
  const visitor = link => {
    if (isRelativeUrl(link.url)) {
      const linkPath = path.join(markdownNode.parent.dir, link.url)
      const linkNode = _.find(files, file => {
        if (file && file.absolutePath) {
          return file.absolutePath === linkPath
        }
        return null
      })
      if (linkNode && linkNode.absolutePath) {
        const newPath = path.join(
          process.cwd(),
          `public`,
          `${linkNode.hash}.${linkNode.extension}`,
        )
        const relativePath = path.join(
          `/${linkNode.hash}.${linkNode.extension}`,
        )
        link.url = `${relativePath}`
        if (!fsExtra.existsSync(newPath)) {
          fsExtra.copy(linkPath, newPath, err => {
            if (err) {
              console.error(`error copying file`, err)
            }
          })
        }
      }
    }
  }

  visit(markdownAST, `link`, link => {
    visitor(link)
  })

  // Also copy gifs since Sharp can't process them.
  visit(markdownAST, `image`, image => {
    if (image.url.slice(-3) === `gif`) {
      visitor(image)
    }
  })
}
