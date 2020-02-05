const Promise = require(`bluebird`)
const path = require(`path`)
const slash = require(`slash`)
const slugify = require(`slugify`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const creatorPageTemplate = path.resolve(
      `src/templates/template-creator-details.js`
    )

    graphql(`
      query {
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
      }
    `).then(result => {
      if (result.errors) {
        return reject(result.errors)
      }

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
    })

    return resolve()
  })
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  let slug
  if (node.internal.type === `CreatorsYaml`) {
    // Creator pages
    const validTypes = {
      individual: `people`,
      agency: `agencies`,
      company: `companies`,
    }

    if (!validTypes[node.type]) {
      throw new Error(
        `Creators must have a type of “individual”, “agency”, or “company”, but invalid type “${node.type}” was provided for ${node.name}.`
      )
    }
    slug = `/creators/${validTypes[node.type]}/${slugify(node.name, {
      lower: true,
    })}`
    createNodeField({ node, name: `slug`, value: slug })
  }
}
