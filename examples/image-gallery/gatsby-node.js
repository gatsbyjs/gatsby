import _ from 'lodash'
import Promise from 'bluebird'
import path from 'path'

exports.createPages = ({ graphql }) => (
  new Promise((resolve, reject) => {
    const pages = []
    const imagePage = path.resolve('templates/image-page.js')
    graphql(`
      {
        allImages(first: 1000) {
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

      // Create blog posts pages.
      _.each(result.data.allImages.edges, (edge) => {
        console.log('gatsby-node', edge)
        pages.push({
          path: edge.node.path, // required
          component: imagePage,
        })
      })

      resolve(pages)
    })
  })
)
