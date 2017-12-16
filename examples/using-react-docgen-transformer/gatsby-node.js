const path = require(`path`)
const fs = require(`fs`)
const appRootDir = require(`app-root-dir`).get()

const componentTemplate = path.resolve(`src/templates/component.js`)
const indexTemplate = path.resolve(`src/templates/index.js`)

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    resolve(
      Promise.all([
        graphql(`
          {
            allComponentMetadata {
              edges {
                node {
                  id
                  displayName
                  props {
                    name
                    type {
                      value
                      raw
                      name
                    }
                    description {
                      text
                    }
                    required
                  }
                }
              }
            }
          }
        `),
        graphql(`
          {
            allMarkdownRemark(
              filter: { fileAbsolutePath: { regex: "/README.md/" } }
            ) {
              edges {
                node {
                  fileAbsolutePath
                  html
                }
              }
            }
          }
        `),
      ])
        .then(([docgenResult, markdownResult]) => {
          const errors = docgenResult.errors || markdownResult.errors
          if (errors) {
            reject(new Error(errors))
            return
          }

          const allComponents = docgenResult.data.allComponentMetadata.edges.map(
            (edge, i) =>
              Object.assign({}, edge.node, {
                path: `/components/${edge.node.displayName.toLowerCase()}/`,
                html: markdownResult.data.allMarkdownRemark.edges[i].node.html,
              })
          )

          const exportFileContents =
            allComponents
              .reduce((accumulator, { id, displayName }) => {
                const absolutePath = id.replace(/ absPath of.*$/, ``)
                accumulator.push(
                  `export { default as ${displayName} } from "${absolutePath}"`
                )
                return accumulator
              }, [])
              .join(`\n`) + `\n`

          fs.writeFileSync(
            path.join(appRootDir, `.cache/components.js`),
            exportFileContents
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
