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
            edge => {
              const { displayName } = edge.node
              return {
                displayName,
                path: `/components/${displayName.toLowerCase()}/`,
              }
            }
          )

          allComponents.forEach(data => {
            const { path } = data
            const context = Object.assign({}, data, {
              allComponents,
            })
            createPage({
              path,
              component: componentTemplate,
              context,
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
