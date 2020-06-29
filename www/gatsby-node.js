const Promise = require(`bluebird`)
const fetch = require(`node-fetch`)
const fs = require(`fs-extra`)
const startersRedirects = require(`./starter-redirects.json`)

const { loadYaml } = require(`./src/utils/load-yaml`)
const redirects = loadYaml(`./redirects.yaml`)

const docs = require(`./src/utils/node/docs.js`)
const blog = require(`./src/utils/node/blog.js`)
const showcase = require(`./src/utils/node/showcase.js`)
const starters = require(`./src/utils/node/starters.js`)
const creators = require(`./src/utils/node/creators.js`)
const packages = require(`./src/utils/node/packages.js`)
const features = require(`./src/utils/node/features.js`)
const sections = [docs, blog, showcase, starters, creators, packages, features]

exports.createPages = async helpers => {
  const { actions } = helpers
  const { createRedirect } = actions

  redirects.forEach(redirect => {
    createRedirect({ isPermanent: true, ...redirect, force: true })
  })

  Object.entries(startersRedirects).forEach(([fromSlug, toSlug]) => {
    createRedirect({
      fromPath: `/starters${fromSlug}`,
      toPath: `/starters${toSlug}`,
      isPermanent: true,
      force: true,
    })
  })

  await Promise.all(sections.map(section => section.createPages(helpers)))
}

// Create slugs for files, set released status for blog posts.
exports.onCreateNode = async helpers => {
  await Promise.all(
    sections.map(section => {
      if (section.onCreateNode) {
        section.onCreateNode(helpers)
      }
    })
  )
}

exports.onPostBuild = () => {
  fs.copySync(
    `../docs/blog/2017-02-21-1-0-progress-update-where-came-from-where-going/gatsbygram.mp4`,
    `./public/gatsbygram.mp4`
  )
}

exports.sourceNodes = async ({
  actions: { createNode },
  createContentDigest,
}) => {
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

exports.createSchemaCustomization = async helpers => {
  for (const section of sections) {
    if (section.createSchemaCustomization) {
      section.createSchemaCustomization(helpers)
    }
  }

  const {
    actions: { createTypes },
  } = helpers

  // Explicitly define Airtable types so that queries still work
  // when there are no events.
  // TODO make upstream change to gatsby-source-airtable
  createTypes(/* GraphQL */ `
    type Airtable implements Node {
      id: ID!
      data: AirtableData
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
  `)
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
