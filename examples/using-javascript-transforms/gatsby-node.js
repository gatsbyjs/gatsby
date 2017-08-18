const path = require(`path`)

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  let slug
  if (
    node.internal.type === `MarkdownRemark` ||
    node.internal.type === `JSFrontmatter`
  ) {
    const fileNode = getNode(node.parent)
    const parsedFilePath = path.parse(fileNode.relativePath)
    if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
      slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
    } else if (parsedFilePath.dir === ``) {
      slug = `/${parsedFilePath.name}/`
    } else {
      slug = `/${parsedFilePath.dir}/`
    }

    // Add slug as a field on the node.
    createNodeField({ node, name: `slug`, value: slug })
  }
}

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {

    const pages = []
    const markdownTemplate = path.resolve(`src/templates/markdown.js`)

    // Query for all markdown "nodes" and for the slug we previously created.
    resolve(
      graphql(
        `
        {
          allMarkdownRemark {
            edges {
              node {
                frontmatter {
                  layoutType
                  path
                }
                fields {
                  slug
                }
              }
            }
          }
          allJsFrontmatter {
            edges {
              node {
                fileAbsolutePath
                data {
                  layoutType
                  path
                }
                fields {
                  slug
                }
              }
            }
          }
        }
      `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          console.log(result)
          reject(result.errors)
        }

        // Create from markdown
        result.data.allMarkdownRemark.edges.forEach(edge => {
          let frontmatter = edge.node.frontmatter
          // ideally we would want to use layoutType to
          //  decide which (nested) layout to use, but
          //  gatsby currently doesnt support this.
          if (
            frontmatter.layoutType === `post` ||
            frontmatter.layoutType === `page`
          ) {
            createPage({
              path: frontmatter.path, // required
              component: markdownTemplate,
              context: {
                layoutType: frontmatter.layoutType,
                slug: edge.node.fields.slug,
              },
            })
          }
        })

        // Create pages from javascript
        // Gatsby will, by default, createPages for javascript in the
        //  /pages directory. We purposely don't have a folder with this name
        //  so that we can go full manual mode.
        result.data.allJsFrontmatter.edges.forEach(edge => {
          let frontmatter = edge.node.data
          // see above
          if (
            frontmatter.layoutType === `post` ||
            frontmatter.layoutType === `page`
          ) {
            createPage({
              path: frontmatter.path, // required
              // Note, we can't have a template, but rather require the file directly.
              //  Templates are for converting non-react into react. jsFrontmatter
              //  picks up all of the javascript files. We have only written these in react.
              component: path.resolve(edge.node.fileAbsolutePath),
              context: {
                layoutType: frontmatter.layoutType,
                slug: edge.node.fields.slug,
              },
            })
          } else if (edge.node.fields.slug === `/index/`) {
            createPage({
              path: `/`, // required, we don't have frontmatter for this page hence separate if()
              component: path.resolve(edge.node.fileAbsolutePath),
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
