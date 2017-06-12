const visit = require(`unist-util-visit`)
const isRelativeUrl = require(`is-relative-url`)
const fsExtra = require(`fs-extra`)
const path = require(`path`)
const _ = require(`lodash`)

module.exports = ({ files, markdownNode, markdownAST, getNode }) => {
  // Copy linked files to the public directory and modify the AST to point to
  // new location of the files.
  const visitor = link => {
    if (
      isRelativeUrl(link.url) &&
      getNode(markdownNode.parent).internal.type === `File`
    ) {
      const linkPath = path.join(getNode(markdownNode.parent).dir, link.url)
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
          `${linkNode.contentDigest}.${linkNode.extension}`
        )
        const relativePath = path.join(
          `/${linkNode.contentDigest}.${linkNode.extension}`
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

  // Also copy gifs since Sharp can't process them,
  // and svgs since we exclude them from the image processing pipeline in
  // gatsby-remark-responsive-image
  visit(markdownAST, `image`, image => {
    const fileType = image.url.slice(-3)
    if (fileType === `gif` || fileType === `svg`) {
      visitor(image)
    }
  })
}
