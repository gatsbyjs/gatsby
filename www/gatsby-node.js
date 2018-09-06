const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const parseFilepath = require(`parse-filepath`)
const fs = require(`fs-extra`)
const slash = require(`slash`)
const slugify = require(`slugify`)
const url = require(`url`)

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

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

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

  createRedirect({
    fromPath: `/docs/netlify-cms`,
    isPermanent: true,
    redirectInBrowser: true,
    toPath: `/docs/sourcing-from-netlify-cms`,
  })

  return new Promise((resolve, reject) => {
    const docsTemplate = path.resolve(`src/templates/template-docs-markdown.js`)
    const blogPostTemplate = path.resolve(`src/templates/template-blog-post.js`)
    const blogListTemplate = path.resolve(`src/templates/template-blog-list.js`)
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
    const showcaseTemplate = path.resolve(
      `src/templates/template-showcase-details.js`
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

    graphql(
      `
        query {
          allMarkdownRemark(
            sort: { order: DESC, fields: [frontmatter___date] }
            limit: 10000
            filter: { fileAbsolutePath: { ne: null } }
          ) {
            edges {
              node {
                fields {
                  slug
                  package
                  starterShowcase {
                    slug
                    stub
                  }
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
          allSitesYaml(filter: { main_url: { ne: null } }) {
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
        return reject(result.errors)
      }

      const blogPosts = _.filter(result.data.allMarkdownRemark.edges, edge => {
        const slug = _.get(edge, `node.fields.slug`)
        const draft = _.get(edge, `node.frontmatter.draft`)
        if (!slug) return undefined

        if (_.includes(slug, `/blog/`) && !draft) {
          return edge
        }

        return undefined
      })

      // Create blog-list pages.
      const postsPerPage = 8
      const numPages = Math.ceil(blogPosts.length / postsPerPage)

      Array.from({ length: numPages }).forEach((_, i) => {
        createPage({
          path: i === 0 ? `/blog` : `/blog/${i + 1}`,
          component: slash(blogListTemplate),
          context: {
            limit: postsPerPage,
            skip: i * postsPerPage,
            numPages,
            currentPage: i + 1,
          },
        })
      })

      // Create blog-post pages.
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
          path: `/blog/tags/${_.kebabCase(tag.toLowerCase())}/`,
          component: tagTemplate,
          context: {
            tag,
          },
        })
      })

      // Create starters.
      const starters = _.filter(result.data.allMarkdownRemark.edges, edge => {
        const slug = _.get(edge, `node.fields.starterShowcase.slug`)
        if (!slug) return null
        else return edge
      })
      const starterTemplate = path.resolve(
        `src/templates/template-starter-showcase.js`
      )

      starters.forEach((edge, index) => {
        createPage({
          path: `/starters${edge.node.fields.starterShowcase.slug}`, // required
          component: slash(starterTemplate),
          context: {
            slug: edge.node.fields.starterShowcase.slug,
            stub: edge.node.fields.starterShowcase.stub,
          },
        })
      })
      // END Create starters.

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

      result.data.allSitesYaml.edges.forEach(edge => {
        if (!edge.node.fields) return
        if (!edge.node.fields.slug) return
        createPage({
          path: `${edge.node.fields.slug}`,
          component: slash(showcaseTemplate),
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

      return resolve()
    })
  })
}

// Create slugs for files.
exports.onCreateNode = ({ node, actions, getNode, getNodes }) => {
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
    if (
      // starter showcase
      fileNode.sourceInstanceName === `StarterShowcaseData` &&
      parsedFilePath.name !== `README`
    ) {
      createNodesForStarterShowcase({ node, getNode, getNodes, actions })
    } // end starter showcase
    if (slug) {
      createNodeField({ node, name: `anchor`, value: slugToAnchor(slug) })
      createNodeField({ node, name: `slug`, value: slug })
    }
  } else if (node.internal.type === `AuthorYaml`) {
    slug = `/contributors/${slugify(node.id, {
      lower: true,
    })}/`
    createNodeField({ node, name: `slug`, value: slug })
  } else if (node.internal.type === `SitesYaml` && node.main_url) {
    const parsed = url.parse(node.main_url)
    const cleaned = parsed.hostname + parsed.pathname
    slug = `/showcase/${slugify(cleaned)}`
    createNodeField({ node, name: `slug`, value: slug })
  }
}

exports.onPostBuild = () => {
  fs.copySync(
    `../docs/blog/2017-02-21-1-0-progress-update-where-came-from-where-going/gatsbygram.mp4`,
    `./public/gatsbygram.mp4`
  )
}

// Starter Showcase related code
const { createFilePath } = require(`gatsby-source-filesystem`)
const gitFolder = `./src/data/StarterShowcase/generatedGithubData`
function createNodesForStarterShowcase({ node, getNode, getNodes, actions }) {
  const { createNodeField, createParentChildLink } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({
      node,
      getNode,
      basePath: `startersData`,
    })
    // preprocessing
    const stub = slug.replace(/\//gi, ``)
    var fromPath = path.join(gitFolder, `${stub}.json`)
    var data = fs.readFileSync(fromPath, `utf8`)
    const ghdata = JSON.parse(data)
    if (ghdata.repository && ghdata.repository.url)
      ghdata.repository = ghdata.repository.url // flatten a potential object into a string. weird quirk.
    const { repoMetadata, dependencies = [], devDependencies = [] } = ghdata
    const allDependencies = Object.entries(dependencies).concat(
      Object.entries(devDependencies)
    )
    // make an object to stick into a Field
    const starterShowcaseFields = {
      slug,
      stub,
      date: new Date(node.frontmatter.date),
      githubData: ghdata,
      // nice-to-have destructures of githubData
      description: ghdata.description,
      stars: repoMetadata.stargazers_count,
      lastUpdated: repoMetadata.created_at,
      owner: repoMetadata.owner,
      githubFullName: repoMetadata.full_name,
      allDependencies,
      gatsbyDependencies: allDependencies
        .filter(
          ([key, _]) => ![`gatsby-cli`, `gatsby-link`].includes(key) // remove stuff everyone has
        )
        .filter(([key, _]) => key.includes(`gatsby`)),
      miscDependencies: allDependencies.filter(
        ([key, _]) => !key.includes(`gatsby`)
      ),
    }
    createNodeField({
      node,
      name: `starterShowcase`,
      value: starterShowcaseFields,
    })
  }
}
// End Starter Showcase related code

// limited logging for debug purposes
let limitlogcount = 0
function log(max) {
  return function(...args) {
    if (limitlogcount++ < max) console.log(...args)
  }
}
