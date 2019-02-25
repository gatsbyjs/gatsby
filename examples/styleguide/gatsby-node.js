const path = require(`path`)
const fs = require(`fs`)
const appRootDir = require(`app-root-dir`).get()

const componentPageTemplate = path.resolve(
  `src/templates/ComponentPage/index.js`
)
const tableOfContentsTemplate = path.resolve(`src/templates/TOC/index.js`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const [docgenResult, markdownResult] = Promise.all([
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

  const errors = docgenResult.errors || markdownResult.errors
  if (errors) {
    throw new Error(errors)
  }

  const allComponents = docgenResult.data.allComponentMetadata.edges.map(
    (edge, i) =>
      Object.assign({}, edge.node, {
        filePath: `/components/${edge.node.displayName}/`,
        html: markdownResult.data.allMarkdownRemark.edges[i].node.html,
      })
  )

  const exportFileContents =
    allComponents
      .reduce((accumulator, { displayName, filePath }) => {
        const absolutePath = path.resolve(
          path.join(`src`, filePath, displayName)
        )
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

  await Promise.all(
    allComponents.map(data => {
      const { filePath } = data
      const context = Object.assign({}, data, {
        allComponents,
      })
      return createPage({
        path: filePath,
        component: componentPageTemplate,
        context,
      })
    })
  )

  return createPage({
    path: `/components/`,
    component: tableOfContentsTemplate,
    context: {
      allComponents,
    },
  })
}
