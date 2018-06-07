const path = require(`path`)
const fs = require(`fs`)
const appRootDir = require(`app-root-dir`).get()

const componentPageTemplate = path.resolve(
  `src/templates/ComponentPage/index.js`
)
const tableOfContentsTemplate = path.resolve(`src/templates/TOC/index.js`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

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
                  description {
                    text
                  }
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
                filePath: `/components/${edge.node.displayName.toLowerCase()}/`,
                html: markdownResult.data.allMarkdownRemark.edges[i].node.html,
              })
          )

          const exportFileContents =
            allComponents
              .reduce((accumulator, { displayName, filePath }) => {
                const absolutePath = path.resolve(path.join('src', filePath, displayName))
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
            const { filePath } = data
            const context = Object.assign({}, data, {
              allComponents,
            })
            createPage({
              path: filePath,
              component: componentPageTemplate,
              context,
            })
          })

          createPage({
            path: `/components/`,
            component: tableOfContentsTemplate,
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
