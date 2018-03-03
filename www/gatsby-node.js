const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const parseFilepath = require(`parse-filepath`)
const fs = require(`fs-extra`)
const slash = require(`slash`)
const slugify = require(`limax`)

// convert a string like `/some/long/path/name-of-docs/` to `name-of-docs`
const slugToAnchor = slug =>
  slug
    .split(`/`) // split on dir separators
    .filter(item => item !== ``) // remove empty values
    .pop() // take last item

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

  // Random redirects
  createRedirect({
    fromPath: `/blog/2018-02-26-documentation-project/`, // Tweeted this link out then switched it
    toPath: `/2018-02-28-documentation-project/`,
    isPermanent: true,
  })

  return new Promise((resolve, reject) => {
    const docsTemplate = path.resolve(`src/templates/template-docs-markdown.js`)
    const blogPostTemplate = path.resolve(`src/templates/template-blog-post.js`)
    const contributorPageTemplate = path.resolve(
      `src/templates/template-contributor-page.js`
    )
    const packageTemplate = path.resolve(
      `src/templates/template-docs-packages.js`
    )

    createRedirect({
      fromPath: `/docs/bound-action-creators/`,
      isPermanent: true,
      redirectInBrowser: true,
      toPath: `/docs/actions/`,
    })

    createRedirect({
      fromPath: `/docs/bound-action-creators`,
      isPermanent: true,
      redirectInBrowser: true,
      toPath: `/docs/actions`,
    })

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
            allAuthorYaml {
              edges {
                node {
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

        // Create contributor pages.
        result.data.allAuthorYaml.edges.forEach(edge => {
          createPage({
            path: `${edge.node.fields.slug}`,
            component: slash(contributorPageTemplate),
            context: {
              slug: edge.node.fields.slug,
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
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
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
      createNodeField({ node, name: `anchor`, value: slugToAnchor(slug) })
      createNodeField({ node, name: `slug`, value: slug })
    }
  } else if (node.internal.type === `AuthorYaml`) {
    slug = `/contributors/${slugify(node.id)}/`
    createNodeField({ node, name: `slug`, value: slug })
  }
}

exports.onPostBuild = () => {
  fs.copySync(
    `../docs/blog/2017-02-21-1-0-progress-update-where-came-from-where-going/gatsbygram.mp4`,
    `./public/gatsbygram.mp4`
  )
}
