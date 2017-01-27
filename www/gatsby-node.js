const _ = require('lodash')
const Promise = require('bluebird')
const path = require('path')
const webpack = require('webpack')
const select = require(`unist-util-select`)
const parseFilepath = require('parse-filepath')

exports.createPages = ({ args }) => {
  const { graphql } = args
  return new Promise((resolve, reject) => {
    const pages = []
    const docsPage = path.resolve(`templates/template-docs-markdown.js`)
    graphql(`
      {
        allMarkdownRemark(limit: 1000) {
          edges {
            node {
              slug
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
      _.each(result.data.allMarkdownRemark.edges, (edge) => {
        pages.push({
          path: `${edge.node.slug}`, // required
          component: docsPage,
          context: {
            slug: edge.node.slug,
          },
        })
      })

      resolve(pages)
    })
  })
}

// Create slug for Markdown files.
exports.modifyAST = ({ args }) => {
  const { ast } = args
  const files = select(ast, 'File')
  files.forEach((file) => {
    const parsedFilePath = parseFilepath(file.relativePath)
    let fileSlug
    if (parsedFilePath.name !== `index`) {
      slug = `/docs${parsedFilePath.dirname}/${parsedFilePath.name}/`
    } else {
      slug = `/docs${parsedFilePath.dirname}/`
    }

    // Add to Markdown node.
    file.children[0].slug = slug

    file.slug = slug
  })

  return files
}
