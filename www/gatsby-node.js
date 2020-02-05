const _ = require(`lodash`)
const Promise = require(`bluebird`)
const fetch = require(`node-fetch`)
const path = require(`path`)
const fs = require(`fs-extra`)
const { slash } = require(`gatsby-core-utils`)
const slugify = require(`slugify`)
const startersRedirects = require(`./starter-redirects.json`)
const {
  generateComparisonPageSet,
} = require(`./src/utils/generate-comparison-page-set.js`)
const { getPrevAndNext } = require(`./src/utils/get-prev-and-next.js`)
const { localizedPath } = require(`./src/utils/i18n.js`)
const yaml = require(`js-yaml`)
const redirects = yaml.load(fs.readFileSync(`./redirects.yaml`))

const docs = require(`./src/utils/node/docs.js`)
const showcase = require(`./src/utils/node/showcase.js`)
const starters = require(`./src/utils/node/starters.js`)
const creators = require(`./src/utils/node/creators.js`)
const packages = require(`./src/utils/node/packages.js`)
const sections = [docs, showcase, starters, creators, packages]

const localPackages = `../packages`
const localPackagesArr = []
fs.readdirSync(localPackages).forEach(file => {
  localPackagesArr.push(file)
})

exports.createPages = ({ graphql, actions, reporter }) => {
  const { createPage, createRedirect } = actions

  redirects.forEach(redirect => {
    createRedirect({ isPermanent: true, ...redirect })
  })

  Object.entries(startersRedirects).forEach(([fromSlug, toSlug]) => {
    createRedirect({
      fromPath: `/starters${fromSlug}`,
      toPath: `/starters${toSlug}`,
      isPermanent: true,
    })
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
    const creatorPageTemplate = path.resolve(
      `src/templates/template-creator-details.js`
    )
    const featureComparisonPageTemplate = path.resolve(
      `src/templates/template-feature-comparison.js`
    )

    // Query for markdown nodes to use in creating pages.
    graphql(`
      query {
        allMdx(
          sort: { order: DESC, fields: [frontmatter___date, fields___slug] }
          limit: 10000
          filter: { fileAbsolutePath: { ne: null } }
        ) {
          edges {
            node {
              fields {
                slug
                locale
                package
                released
              }
              frontmatter {
                title
                draft
                canonicalLink
                publishedAt
                issue
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
        allCreatorsYaml {
          edges {
            node {
              name
              fields {
                slug
              }
            }
          }
        }
        allSitesYaml(filter: { main_url: { ne: null } }) {
          edges {
            node {
              main_url
              fields {
                slug
                hasScreenshot
              }
            }
          }
        }
        allStartersYaml {
          edges {
            node {
              id
              fields {
                starterShowcase {
                  slug
                  stub
                }
                hasScreenshot
              }
              url
              repo
            }
          }
        }
        allNpmPackage {
          edges {
            node {
              id
              title
              slug
            }
          }
        }
      }
    `).then(result => {
      if (result.errors) {
        return reject(result.errors)
      }

      const blogPosts = _.filter(result.data.allMdx.edges, edge => {
        const slug = _.get(edge, `node.fields.slug`)
        const draft = _.get(edge, `node.frontmatter.draft`)
        if (!slug) return undefined

        if (_.includes(slug, `/blog/`) && !draft) {
          return edge
        }

        return undefined
      })

      const releasedBlogPosts = blogPosts.filter(post =>
        _.get(post, `node.fields.released`)
      )

      // Create blog-list pages.
      const postsPerPage = 8
      const numPages = Math.ceil(releasedBlogPosts.length / postsPerPage)

      Array.from({
        length: numPages,
      }).forEach((_, i) => {
        createPage({
          path: i === 0 ? `/blog` : `/blog/page/${i + 1}`,
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
        let next = index === 0 ? null : blogPosts[index - 1].node
        if (next && !_.get(next, `fields.released`)) next = null

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

      const makeSlugTag = tag => _.kebabCase(tag.toLowerCase())

      // Collect all tags and group them by their kebab-case so that
      // hyphenated and spaced tags are treated the same. e.g
      // `case-study` -> [`case-study`, `case study`]. The hyphenated
      // version will be used for the slug, and the spaced version
      // will be used for human readability (see templates/tags)
      const tagGroups = _(releasedBlogPosts)
        .map(post => _.get(post, `node.frontmatter.tags`))
        .filter()
        .flatten()
        .uniq()
        .groupBy(makeSlugTag)

      tagGroups.forEach((tags, tagSlug) => {
        createPage({
          path: `/blog/tags/${tagSlug}/`,
          component: tagTemplate,
          context: {
            tags,
          },
        })
      })

      // Create starter pages.
      const starters = _.filter(result.data.allStartersYaml.edges, edge => {
        const slug = _.get(edge, `node.fields.starterShowcase.slug`)
        if (!slug) {
          return null
        } else if (!_.get(edge, `node.fields.hasScreenshot`)) {
          reporter.warn(
            `Starter showcase entry "${edge.node.repo}" seems offline. Skipping.`
          )
          return null
        } else {
          return edge
        }
      })

      const starterTemplate = path.resolve(
        `src/templates/template-starter-page.js`
      )

      starters.forEach((edge, index) => {
        createPage({
          path: `/starters${edge.node.fields.starterShowcase.slug}`,
          component: slash(starterTemplate),
          context: {
            slug: edge.node.fields.starterShowcase.slug,
            stub: edge.node.fields.starterShowcase.stub,
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

      result.data.allCreatorsYaml.edges.forEach(edge => {
        if (!edge.node.fields) return
        if (!edge.node.fields.slug) return
        createPage({
          path: `${edge.node.fields.slug}`,
          component: slash(creatorPageTemplate),
          context: {
            slug: edge.node.fields.slug,
            name: edge.node.name,
          },
        })
      })

      result.data.allSitesYaml.edges.forEach(edge => {
        if (!edge.node.fields) return
        if (!edge.node.fields.slug) return
        if (!edge.node.fields.hasScreenshot) {
          reporter.warn(
            `Site showcase entry "${edge.node.main_url}" seems offline. Skipping.`
          )
          return
        }
        createPage({
          path: `${edge.node.fields.slug}`,
          component: slash(showcaseTemplate),
          context: {
            slug: edge.node.fields.slug,
          },
        })
      })

      // Create docs pages.
      const docPages = result.data.allMdx.edges

      docPages.forEach(({ node }) => {
        const slug = _.get(node, `fields.slug`)
        const locale = _.get(node, `fields.locale`)
        if (!slug) return

        if (!_.includes(slug, `/blog/`)) {
          createPage({
            path: localizedPath(locale, node.fields.slug),
            component: slash(
              node.fields.package ? localPackageTemplate : docsTemplate
            ),
            context: {
              slug: node.fields.slug,
              locale,
              ...getPrevAndNext(node.fields.slug),
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
              layout: `plugins`,
            },
          })
        } else {
          createPage({
            path: edge.node.slug,
            component: slash(remotePackageTemplate),
            context: {
              slug: edge.node.slug,
              id: edge.node.id,
              layout: `plugins`,
            },
          })
        }
      })

      // Create feature comparison pages
      const jamstackPages = generateComparisonPageSet(`jamstack`)
      const cmsPages = generateComparisonPageSet(`cms`)
      const comparisonPages = [...jamstackPages, ...cmsPages]
      for (const { path, options, featureType } of comparisonPages) {
        createPage({
          path,
          component: slash(featureComparisonPageTemplate),
          context: {
            options,
            featureType,
          },
        })
      }

      return resolve()
    })
  })
}

// Create slugs for files, set released status for blog posts.
exports.onCreateNode = helpers => {
  sections.forEach(section => section.onCreateNode(helpers))

  const { node, actions } = helpers
  const { createNodeField } = actions
  let slug
  if (node.internal.type === `AuthorYaml`) {
    slug = `/contributors/${slugify(node.id, {
      lower: true,
    })}/`
    createNodeField({ node, name: `slug`, value: slug })
  }
  return null
}

exports.onCreatePage = ({ page, actions }) => {
  if (page.path === `/plugins/`) {
    const { createPage, deletePage } = actions
    const oldPage = Object.assign({}, page)

    page.context.layout = `plugins`
    deletePage(oldPage)
    createPage(page)
  }
}

exports.onPostBuild = () => {
  fs.copySync(
    `../docs/blog/2017-02-21-1-0-progress-update-where-came-from-where-going/gatsbygram.mp4`,
    `./public/gatsbygram.mp4`
  )
}

// XXX this should probably be a plugin or something.
exports.sourceNodes = async ({
  actions: { createTypes, createNode },
  createContentDigest,
  schema,
}) => {
  /*
   * NOTE: This _only_ defines the schema we currently query for. If anything in
   * the query at `src/pages/contributing/events.js` changes, we need to make
   * sure these types are updated as well.
   *
   * But why?! Why would I do something this fragile?
   *
   * Gather round, children, and I’ll tell you the tale of @jlengstorf being too
   * lazy to make upstream fixes...
   */
  const typeDefs = `
    type Airtable implements Node {
      id: ID!
      data: AirtableData
    }

    type SitesYaml implements Node {
      title: String!
      main_url: String!
      url: String!
      source_url: String
      featured: Boolean
      categories: [String]!
      built_by: String
      built_by_url: String
      description: String
      screenshotFile: Screenshot # added by gatsby-transformer-screenshot
    }

    type StartersYaml implements Node {
      url: String!
      repo: String!
      description: String
      tags: [String!]
      features: [String!]
      screenshotFile: Screenshot # added by gatsby-transformer-screenshot
    }

    type AirtableData @dontInfer {
      name: String @proxy(from: "Name_of_Event")
      organizerFirstName: String @proxy(from: "Organizer_Name")
      organizerLastName: String @proxy(from: "Organizer's_Last_Name")
      date: Date @dateformat @proxy(from: "Date_of_Event")
      location: String @proxy(from: "Location_of_Event")
      url: String @proxy(from: "Event_URL_(if_applicable)")
      type: String @proxy(from: "What_type_of_event_is_this?")
      hasGatsbyTeamSpeaker: Boolean @proxy(from: "Gatsby_Speaker_Approved")
      approved: Boolean @proxy(from: "Approved_for_posting_on_event_page")
    }
  `

  createTypes(typeDefs)

  // get data from GitHub API at build time
  const result = await fetch(`https://api.github.com/repos/gatsbyjs/gatsby`)
  const resultData = await result.json()
  // create node for build time data example in the docs
  createNode({
    nameWithOwner: resultData.full_name,
    url: resultData.html_url,
    // required fields
    id: `example-build-time-data`,
    parent: null,
    children: [],
    internal: {
      type: `Example`,
      contentDigest: createContentDigest(resultData),
    },
  })
}

exports.onCreateWebpackConfig = ({ actions, plugins }) => {
  const currentCommitSHA = require(`child_process`)
    .execSync(`git rev-parse HEAD`, {
      encoding: `utf-8`,
    })
    .trim()

  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        "process.env.COMMIT_SHA": JSON.stringify(currentCommitSHA),
      }),
    ],
  })
}

// Patch `DocumentationJs` type to handle custom `@availableIn` jsdoc tag
exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    DocumentationJs: {
      availableIn: {
        type: `[String]`,
        resolve(source) {
          const { tags } = source
          if (!tags || !tags.length) {
            return []
          }

          const availableIn = tags.find(tag => tag.title === `availableIn`)
          if (availableIn) {
            return availableIn.description
              .split(`\n`)[0]
              .replace(/[[\]]/g, ``)
              .split(`,`)
              .map(api => api.trim())
          }

          return []
        },
      },
    },
  })
}
