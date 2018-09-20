const path = require(`path`)

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  let slug
  if (
    node.internal.type === `MarkdownRemark` ||
    node.internal.type === `JavascriptFrontmatter`
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

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const mdInsetPage = path.resolve(`src/templates/mdInsetPage.js`)
    const mdBlogPost = path.resolve(`src/templates/mdBlogPost.js`)

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
            allJavascriptFrontmatter {
              edges {
                node {
                  fileAbsolutePath
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
          let { frontmatter } = edge.node
          if (frontmatter.layoutType === `post`) {
            createPage({
              path: frontmatter.path, // required
              component: mdBlogPost,
              context: {
                slug: edge.node.fields.slug,
              },
            })
          } else if (frontmatter.layoutType === `page`) {
            createPage({
              path: frontmatter.path, // required
              component: mdInsetPage,
              context: {
                slug: edge.node.fields.slug,
              },
            })
          }
        })

        // Create pages from javascript
        // Gatsby will, by default, createPages for javascript in the
        //  /pages directory. We purposely don't have a folder with this name
        //  so that we can go full manual mode.
        result.data.allJavascriptFrontmatter.edges.forEach(edge => {
          let { frontmatter } = edge.node
          // see above
          if (frontmatter.layoutType === `post`) {
            createPage({
              path: frontmatter.path, // required
              // Note, we can't have a template, but rather require the file directly.
              //  Templates are for converting non-react into react. jsFrontmatter
              //  picks up all of the javascript files. We have only written these in react.
              component: path.resolve(edge.node.fileAbsolutePath),
              context: {
                slug: edge.node.fields.slug,
              },
            })
          } else if (frontmatter.layoutType === `page`) {
            createPage({
              path: frontmatter.path, // required
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
