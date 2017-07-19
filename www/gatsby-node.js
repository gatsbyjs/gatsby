const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const parseFilepath = require(`parse-filepath`)
const fs = require(`fs-extra`)
const slash = require(`slash`)

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    const docsTemplate = path.resolve(`src/templates/template-docs-markdown.js`)
    const blogPostTemplate = path.resolve(`src/templates/template-blog-post.js`)
    const packageTemplate = path.resolve(
      `src/templates/template-docs-packages.js`
    )
    // Query for markdown nodes to use in creating pages.
    resolve(
      graphql(
        `
      {
        allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___date] }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
                package
              }
              frontmatter {
                title
                draft
                canonicalLink
                publishedAt
              }
            }
          }
        }
      }
    `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        const blogPosts = _.filter(
          result.data.allMarkdownRemark.edges,
          edge => {
            const slug = _.get(edge, `node.fields.slug`)
            const draft = _.get(edge, `node.frontmatter.draft`)
            if (!slug) return

            if (_.includes(slug, `/blog/`) && !draft) {
              return edge
            }
          }
        )

        // Create blog pages.
        blogPosts.forEach((edge, index) => {
          const next = index === 0 ? false : blogPosts[index - 1].node
          const prev =
            index === blogPosts.length - 1 ? false : blogPosts[index + 1].node

          createPage({
            path: `${edge.node.fields.slug}`, // required
            component: slash(blogPostTemplate),
            context: {
              slug: edge.node.fields.slug,
              prev,
              next,
            },
          })
        })

        // Create docs pages.
        result.data.allMarkdownRemark.edges.forEach(edge => {
          const slug = _.get(edge, `node.fields.slug`)
          if (!slug) return

          if (!_.includes(slug, `/blog/`)) {
            createPage({
              path: `${edge.node.fields.slug}`, // required
              component: slash(
                edge.node.fields.package ? packageTemplate : docsTemplate
              ),
              context: {
                slug: edge.node.fields.slug,
              },
            })
          }
        })

        return
      })
    )
  })
}

// Create slugs for files.
exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  let slug
  if (node.internal.type === `File`) {
    const parsedFilePath = parseFilepath(node.relativePath)
    if (node.sourceInstanceName === `docs`) {
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }
    }
    if (slug) {
      createNodeField({ node, name: `slug`, value: slug })
    }
  } else if (
    node.internal.type === `MarkdownRemark` &&
    getNode(node.parent).internal.type === `File`
  ) {
    const fileNode = getNode(node.parent)
    const parsedFilePath = parseFilepath(fileNode.relativePath)
    // Add slugs for docs pages
    if (fileNode.sourceInstanceName === `docs`) {
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
      fileNode.sourceInstanceName === `packages` &&
      parsedFilePath.name === `README`
    ) {
      slug = `/packages/${parsedFilePath.dir}/`
      createNodeField({
        node,
        name: `title`,
        value: parsedFilePath.dir,
      })
      createNodeField({ node, name: `package`, value: true })
    }
    if (slug) {
      createNodeField({ node, name: `slug`, value: slug })
    }
  }
}

exports.onPostBuild = () => {
  fs.copySync(
    `../docs/blog/2017-02-21-1-0-progress-update-where-came-from-where-going/gatsbygram.mp4`,
    `./public/gatsbygram.mp4`
  )
}
