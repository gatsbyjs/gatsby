const _ = require("lodash")
const Promise = require("bluebird")
const path = require("path")
const parseFilepath = require("parse-filepath")
const fs = require("fs-extra")
const slash = require("slash")

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { upsertPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    const docsTemplate = path.resolve(`src/templates/template-docs-markdown.js`)
    const blogPostTemplate = path.resolve(`src/templates/template-blog-post.js`)
    const packageTemplate = path.resolve(
      `src/templates/template-docs-packages.js`
    )
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
        console.log(result.errors)
      }

      // Create docs pages.
      _.each(result.data.allMarkdownRemark.edges, edge => {
        if (_.includes(edge.node.slug, `/blog/`)) {
          upsertPage({
            path: `${edge.node.slug}`, // required
            component: slash(blogPostTemplate),
            context: {
              slug: edge.node.slug,
            },
          })
        } else {
          upsertPage({
            path: `${edge.node.slug}`, // required
            component: slash(
              edge.node.package ? packageTemplate : docsTemplate
            ),
            context: {
              slug: edge.node.slug,
            },
          })
        }
      })

      resolve()
    })
  })
}

// Create slugs for files.
exports.onNodeCreate = ({ node, boundActionCreators, getNode }) => {
  const { updateNode } = boundActionCreators
  let slug
  if (node.type === `File`) {
    const parsedFilePath = parseFilepath(node.relativePath)
    if (node.sourceName === `docs`) {
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }
    }
    if (slug) {
      node.slug = slug
      updateNode(node)
    }
  } else if (node.type === `MarkdownRemark`) {
    const fileNode = getNode(node.parent)
    const parsedFilePath = parseFilepath(fileNode.relativePath)
    // Add slugs for docs pages
    if (fileNode.sourceName === `docs`) {
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }
    }
    // Add slugs for package READMEs.
    if (
      fileNode.sourceName === `packages` && parsedFilePath.name === `README`
    ) {
      slug = `/docs/packages/${parsedFilePath.dir}/`
      node.frontmatter = {}
      node.frontmatter.title = parsedFilePath.dir
      node.package = true
    }
    if (slug) {
      node.slug = slug
      updateNode(node)
    }
  }
}

exports.postBuild = () => {
  fs.copySync(
    `../docs/blog/2017-02-21-1-0-progress-update-where-came-from-where-going/gatsbygram.mp4`,
    `./public/gatsbygram.mp4`
  )
}
