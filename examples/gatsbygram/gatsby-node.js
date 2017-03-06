const _ = require("lodash")
const Promise = require("bluebird")
const path = require("path")
const slug = require("slug")

exports.createPages = ({ args }) => (
  new Promise((resolve, reject) => {
    const { graphql } = args
    const pages = []
    const postPage = path.resolve(`pages/template-post-page.js`)
    graphql(`
      {
        allPosts(limit: 1000) {
          edges {
            node {
              id
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
      _.each(result.data.allPosts.edges, (edge) => {
        pages.push({
          path: slug(edge.node.id), // required
          component: postPage,
          context: {
            id: edge.node.id,
          },
        })
      })

      resolve(pages)
    })
  })
)
