const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const parseFilepath = require(`parse-filepath`)
const fs = require(`fs-extra`)
const slash = require(`slash`)
const slugify = require(`limax`)

const localPackages = `../packages`
const localPackagesArr = []
fs.readdirSync(localPackages).forEach(file => {
  localPackagesArr.push(file)
})
// convert a string like `/some/long/path/name-of-docs/` to `name-of-docs`
const slugToAnchor = slug =>
  slug
    .split(`/`) // split on dir separators
    .filter(item => item !== ``) // remove empty values
    .pop() // take last item

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage, createRedirect } = boundActionCreators

  // Random redirects
  createRedirect({
    fromPath: `/blog/2018-02-26-documentation-project/`, // Tweeted this link out then switched it
    toPath: `/blog/2018-02-28-documentation-project/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/community/`, // Moved "Community" page from /community to /docs/community
    toPath: `/docs/community/`,
    isPermanent: true,
  })

  createRedirect({
    fromPath: `/packages/`, // Moved "Plugins" page from /packages to /plugins
    toPath: `/plugins/`,
    isPermanent: true,
  })

  return new Promise((resolve, reject) => {
    const docsTemplate = path.resolve(`src/templates/template-docs-markdown.js`)
    const blogPostTemplate = path.resolve(`src/templates/template-blog-post.js`)
    const tagTemplate = path.resolve(`src/templates/tags.js`)
    const contributorPageTemplate = path.resolve(
      `src/templates/template-contributor-page.js`
    )
    const localPackageTemplate = path.resolve(
      `src/templates/template-docs-local-packages.js`
    )
    const remotePackageTemplate = path.resolve(
      `src/templates/template-docs-remote-packages.js`
    )
    // Query for markdown nodes to use in creating pages.
    resolve(
      graphql(
        `
          query {
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
                    tags
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
            allNpmPackage {
              edges {
                node {
                  id
                  title
                  slug
                  readme {
                    id
                    childMarkdownRemark {
                      id
                      html
                    }
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
          const next = index === 0 ? null : blogPosts[index - 1].node
          const prev =
            index === blogPosts.length - 1 ? null : blogPosts[index + 1].node

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

        const tagLists = blogPosts
          .filter(post => _.get(post, `node.frontmatter.tags`))
          .map(post => _.get(post, `node.frontmatter.tags`))

        _.uniq(_.flatten(tagLists)).forEach(tag => {
          createPage({
            path: `/blog/tags/${_.kebabCase(tag)}/`,
            component: tagTemplate,
            context: {
              tag,
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
                edge.node.fields.package ? localPackageTemplate : docsTemplate
              ),
              context: {
                slug: edge.node.fields.slug,
              },
            })
          }
        })

        const allPackages = result.data.allNpmPackage.edges
        // Create package readme
        allPackages.forEach(edge => {
          if (_.includes(localPackagesArr, edge.node.title)) {
            createPage({
              path: edge.node.slug,
              component: slash(localPackageTemplate),
              context: {
                slug: edge.node.slug,
                id: edge.node.id,
              },
            })
          } else {
            createPage({
              path: edge.node.slug,
              component: slash(remotePackageTemplate),
              context: {
                slug: edge.node.slug,
                id: edge.node.id,
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
