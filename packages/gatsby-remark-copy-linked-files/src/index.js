const visit = require(`unist-util-visit`)
const isRelativeUrl = require(`is-relative-url`)
const fsExtra = require(`fs-extra`)
const path = require(`path`)
const _ = require(`lodash`)
const $ = require(`cheerio`)

module.exports = ({ files, markdownNode, markdownAST, getNode }) => {
  const filesToCopy = new Map()
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
          `${linkNode.internal.contentDigest}.${linkNode.extension}`
        )
        const relativePath = path.join(
          `/${linkNode.internal.contentDigest}.${linkNode.extension}`
        )
        link.url = `${relativePath}`

        filesToCopy.set(linkPath, newPath)
      }
    }
  }

  visit(markdownAST, `link`, link => {
    visitor(link)
  })

  // Also copy gifs since Sharp can't process them as well as svgs since we
  // exclude them from the image processing pipeline in
  // gatsby-remark-images. This will only work for markdown img tags
  visit(markdownAST, `image`, image => {
    const imagePath = path.join(getNode(markdownNode.parent).dir, image.url)
    const imageNode = _.find(files, file => {
      if (file && file.absolutePath) {
        return file.absolutePath === imagePath
      }
      return false
    })
    if (
      imageNode &&
      (imageNode.extension === `gif` || imageNode.extension === `svg`)
    ) {
      visitor(image)
    }
  })

  // Same as the above except it only works for html img tags
  visit(markdownAST, `html`, node => {
    if (node.value.startsWith(`<img`)) {
      let image = Object.assign(node, $.parseHTML(node.value)[0].attribs)
      image.url = image.src
      image.type = `image`
      image.position = node.position

      const imagePath = path.join(getNode(markdownNode.parent).dir, image.url)
      const imageNode = _.find(files, file => {
        if (file && file.absolutePath) {
          return file.absolutePath === imagePath
        }
        return false
      })
      if (
        imageNode &&
        (imageNode.extension === `gif` || imageNode.extension === `svg`)
      ) {
        visitor(image)
      }
    }
  })

  return Promise.all(
    Array.from(filesToCopy, async ([linkPath, newPath]) => {
      if (!fsExtra.existsSync(newPath)) {
        try {
          await fsExtra.copy(linkPath, newPath)
        } catch (err) {
          console.error(`error copying file`, err)
        }
      }
    })
  )
}
