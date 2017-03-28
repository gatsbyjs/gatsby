const _ = require("lodash")
const Promise = require("bluebird")
const path = require("path")
const select = require("unist-util-select")
const parseFilepath = require("parse-filepath")
const fs = require("fs-extra")

exports.createPages = ({ args }) => {
  const { graphql } = args
  return new Promise((resolve, reject) => {
    const pages = []
    const docsTemplate = path.resolve(`templates/template-docs-markdown.js`)
    const blogPostTemplate = path.resolve(`templates/template-blog-post.js`)
    const packageTemplate = path.resolve(`templates/template-docs-packages.js`)
    graphql(
      `
      {
        allMarkdownRemark(limit: 1000) {
          edges {
            node {
              slug
              package
            }
          }
        }
      }
    `
    ).then(result => {
      if (result.errors) {
        // console.log(result.errors)
        reject(result.errors)
      }

      // Create docs pages.
      _.each(result.data.allMarkdownRemark.edges, edge => {
        // console.log(edge.node.slug)
        if (_.includes(edge.node.slug, `/blog/`)) {
          pages.push({
            path: `${edge.node.slug}`, // required
            component: blogPostTemplate,
            context: {
              slug: edge.node.slug,
            },
          })
        } else {
          pages.push({
            path: `${edge.node.slug}`, // required
            component: edge.node.package ? packageTemplate : docsTemplate,
            context: {
              slug: edge.node.slug,
            },
          })
        }
      })

      resolve(pages)
    })
  })
}

// Create slugs for files.
exports.modifyDataTree = ({ args }) => {
  const { dataTree } = args
  const files = select(dataTree, `File`)
  files.forEach(file => {
    const parsedFilePath = parseFilepath(file.relativePath)
    let slug
    if (file.sourceName === `docs`) {
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }

      // Generate slugs for package READMEs.
    } else if (
      file.sourceName === `packages` && parsedFilePath.name === `README`
    ) {
      slug = `/docs/packages/${parsedFilePath.dir}/`
      file.children[0].frontmatter = {}
      file.children[0].frontmatter.title = parsedFilePath.dir
      file.children[0].package = true
    }

    // Add to File & child nodes.
    if (file.children[0]) {
      file.children[0].slug = slug
    }
    file.slug = slug
  })

  return files
}

exports.postBuild = () => {
  fs.copySync(
    `../docs/blog/2017-02-21-1-0-progress-update-where-came-from-where-going/gatsbygram.mp4`,
    `./public/gatsbygram.mp4`
  )
}
