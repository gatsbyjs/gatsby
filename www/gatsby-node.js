import _ from 'lodash'
import Promise from 'bluebird'
import path from 'path'
import webpack from 'webpack'

exports.createPages = ({ graphql }) => (
  new Promise((resolve, reject) => {
    const pages = []
    const docsPage = path.resolve(`templates/template-docs-markdown.js`)
    graphql(`
      {
        allMarkdown(first: 1000) {
          edges {
            node {
              path
            }
          }
        }
      }
    `)
    .then(result => {
      if (result.errors) {
        console.log(result.errors)
        reject(result.errors)
      }

      // Create docs pages.
      _.each(result.data.allMarkdown.edges, (edge) => {
        pages.push({
          path: `/docs${edge.node.path}`, // required
          filePath: edge.node.path,
          component: docsPage,
        })
      })

      resolve(pages)
    })
  })
)

exports.modifyWebpackConfig = (config) => {
  config.plugin(`Glamor`, webpack.ProvidePlugin, [{
    Glamor: `glamor/react`,
  }])
  return config
}
