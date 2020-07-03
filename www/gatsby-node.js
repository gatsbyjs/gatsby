const Promise = require(`bluebird`)
const startersRedirects = require(`./starter-redirects.json`)

const { loadYaml } = require(`./src/utils/load-yaml`)
const redirects = loadYaml(`./redirects.yaml`)

// Split the logic into files based on the section of the website.
// The eventual goal is to split www into different themes per section.
const docs = require(`./src/utils/node/docs.js`)
const blog = require(`./src/utils/node/blog.js`)
const showcase = require(`./src/utils/node/showcase.js`)
const starters = require(`./src/utils/node/starters.js`)
const creators = require(`./src/utils/node/creators.js`)
const packages = require(`./src/utils/node/packages.js`)
const features = require(`./src/utils/node/features.js`)
const sections = [docs, blog, showcase, starters, creators, packages, features]

// Run the provided API on all defined sections of the site
async function runApiForSections(api, helpers) {
  await Promise.all(
    sections.map(section => {
      if (section[api]) {
        section[api](helpers)
      }
    })
  )
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

exports.createSchemaCustomization = async helpers => {
  await runApiForSections(`createSchemaCustomization`, helpers)

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

exports.onCreateNode = async helpers => {
  await runApiForSections(`onCreateNode`, helpers)
}

exports.createPages = async helpers => {
  await runApiForSections(`createPages`, helpers)

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
}
