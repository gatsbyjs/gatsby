const _ = require(`lodash`)
const Promise = require(`bluebird`)
const path = require(`path`)
const fs = require(`fs-extra`)
const slash = require(`slash`)
const getpkgjson = require(`get-package-json-from-github`)
const parseGHUrl = require(`parse-github-url`)
const { GraphQLClient } = require(`@jamo/graphql-request`)
const yaml = require(`js-yaml`)
const ecosystemFeaturedItems = yaml.load(
  fs.readFileSync(`./src/data/ecosystem/featured-items.yaml`)
)

if (
  process.env.gatsby_executing_command === `build` &&
  !process.env.GITHUB_API_TOKEN
) {
  throw new Error(
    `A GitHub token is required to build the site. Check the README.`
  )
}

// used to gather repo data on starters
const githubApiClient = process.env.GITHUB_API_TOKEN
  ? new GraphQLClient(`https://api.github.com/graphql`, {
      headers: {
        authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
      },
    })
  : null

exports.createPages = ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const starterTemplate = path.resolve(
      `src/templates/template-starter-page.js`
    )

    graphql(`
      query {
        allStartersYaml {
          nodes {
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
    `).then(result => {
      if (result.errors) {
        return reject(result.errors)
      }

      // Create starter pages.
      const starters = _.filter(result.data.allStartersYaml.nodes, node => {
        const slug = _.get(node, `fields.starterShowcase.slug`)
        if (!slug) {
          return null
        } else if (!_.get(node, `fields.hasScreenshot`)) {
          reporter.warn(
            `Starter showcase entry "${node.repo}" seems offline. Skipping.`
          )
          return null
        } else {
          return node
        }
      })

      starters.forEach((node, index) => {
        createPage({
          path: `/starters${node.fields.starterShowcase.slug}`,
          component: slash(starterTemplate),
          context: {
            slug: node.fields.starterShowcase.slug,
            stub: node.fields.starterShowcase.stub,
          },
        })
      })
    })

    return resolve()
  })
}

exports.onCreateNode = ({ node, actions, getNode, reporter }) => {
  const { createNodeField } = actions
  if (node.internal.type === `StartersYaml` && node.repo) {
    // To develop on the starter showcase, you'll need a GitHub
    // personal access token. Check the `www` README for details.
    // Default fields are to avoid graphql errors.
    const { owner, name: repoStub } = parseGHUrl(node.repo)

    // mark if it's a featured starter
    if (ecosystemFeaturedItems.starters.includes(`/${owner}/${repoStub}/`)) {
      createNodeField({ node, name: `featured`, value: true })
    }

    const defaultFields = {
      slug: `/${owner}/${repoStub}/`,
      stub: repoStub,
      name: ``,
      description: ``,
      stars: 0,
      lastUpdated: ``,
      owner: ``,
      githubFullName: ``,
      gatsbyMajorVersion: [[`no data`, `0`]],
      allDependencies: [[`no data`, `0`]],
      gatsbyDependencies: [[`no data`, `0`]],
      miscDependencies: [[`no data`, `0`]],
    }

    // determine if screenshot is available
    const screenshotNode = node.children
      .map(childID => getNode(childID))
      .find(node => node.internal.type === `Screenshot`)

    createNodeField({ node, name: `hasScreenshot`, value: !!screenshotNode })

    if (!process.env.GITHUB_API_TOKEN) {
      return createNodeField({
        node,
        name: `starterShowcase`,
        value: {
          ...defaultFields,
        },
      })
    } else {
      return Promise.all([
        getpkgjson(node.repo),
        githubApiClient.request(`
            query {
              repository(owner:"${owner}", name:"${repoStub}") {
                name
                stargazers {
                  totalCount
                }
                createdAt
                pushedAt
                owner {
                  login
                }
                nameWithOwner
              }
            }
          `),
      ])
        .then(results => {
          const [pkgjson, githubData] = results
          const {
            stargazers: { totalCount: stars },
            pushedAt: lastUpdated,
            owner: { login: owner },
            name,
            nameWithOwner: githubFullName,
          } = githubData.repository

          const { dependencies = [], devDependencies = [] } = pkgjson
          const allDependencies = Object.entries(dependencies).concat(
            Object.entries(devDependencies)
          )

          const gatsbyMajorVersion = allDependencies
            .filter(([key, _]) => key === `gatsby`)
            .map(version => {
              let [gatsby, versionNum] = version
              if (versionNum === `latest` || versionNum === `next`) {
                return [gatsby, `2`]
              }
              return [gatsby, versionNum.replace(/\D/g, ``).charAt(0)]
            })

          // If a new field is added here, make sure a corresponding
          // change is made to "defaultFields" to not break DX
          const starterShowcaseFields = {
            slug: `/${owner}/${repoStub}/`,
            stub: repoStub,
            name,
            description: pkgjson.description,
            stars,
            lastUpdated,
            owner,
            githubFullName,
            gatsbyMajorVersion,
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
        })
        .catch(err => {
          reporter.panicOnBuild(
            `Error getting repo data for starter "${repoStub}":\n
            ${err.message}`
          )
        })
    }
  }
}
