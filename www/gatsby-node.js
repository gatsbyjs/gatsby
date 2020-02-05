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
const yaml = require(`js-yaml`)
const redirects = yaml.load(fs.readFileSync(`./redirects.yaml`))

const docs = require(`./src/utils/node/docs.js`)
const showcase = require(`./src/utils/node/showcase.js`)
const starters = require(`./src/utils/node/starters.js`)
const creators = require(`./src/utils/node/creators.js`)
const packages = require(`./src/utils/node/packages.js`)
const sections = [docs, showcase, starters, creators, packages]

exports.createPages = helpers => {
  const { graphql, actions } = helpers
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
    const contributorPageTemplate = path.resolve(
      `src/templates/template-contributor-page.js`
    )
    const featureComparisonPageTemplate = path.resolve(
      `src/templates/template-feature-comparison.js`
    )

    // Query for markdown nodes to use in creating pages.
    graphql(`
      query {
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
    `).then(result => {
      if (result.errors) {
        return reject(result.errors)
      }

      Promise.all(sections.map(section => section.createPages(helpers)))

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
