const path = require(`path`)

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  console.log(`creating pages`)

  return new Promise((resolve, reject) => {
    resolve(
      graphql(`
        {
          allComponentMetadata {
            edges {
              node {
                displayName
              }
            }
          }
        }
      `)
        .then(result => {
          if (result.errors) {
            reject(new Error(result.errors))
            return
          }

          const componentTemplate = path.resolve(`src/templates/component.js`)
          const indexTemplate = path.resolve(`src/templates/index.js`)
          const allComponents = result.data.allComponentMetadata.edges.map(
            edge => edge.node.displayName
          )

          allComponents.forEach(displayName => {
            createPage({
              path: `/components/${displayName.toLowerCase()}/`,
              component: componentTemplate,
              context: {
                displayName,
                allComponents,
              },
            })
          })

          createPage({
            path: `/components/`,
            component: indexTemplate,
            context: {
              allComponents,
            },
          })
        })
        .catch(err => {
          console.log(err)
          throw new Error(err)
        })
    )
  })
}
