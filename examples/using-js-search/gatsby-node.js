/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const path = require(`path`)
const axios = require(`axios`)

exports.createPages = ({ actions }) => {
  const { createPage } = actions
  return new Promise((resolve, reject) => {
    axios
      .get(`https://bvaughn.github.io/js-search/books.json`)
      .then(result => {
        const { data } = result

        createPage({
          path: `/search`,
          component: path.resolve(`./src/templates/ClientSearchTemplate.js`),
          context: {
            bookData: {
              allBooks: data.books,
              options: {
                indexStrategy: `Prefix match`,
                searchSanitizer: `Lower Case`,
                TitleIndex: true,
                AuthorIndex: true,
                SearchByTerm: true,
              },
            },
          },
        })
        resolve()
      })
      .catch(err => {
        console.log(`====================================`)
        console.log(`error creating Page:${err}`)
        console.log(`====================================`)
        reject(new Error(`error on page creation:\n${err}`))
      })
  })
}

exports.onCreateWebpackConfig = ({ actions }) => {
  /* eslint-disable */
  actions.setWebpackConfig({
    resolve: {
      alias: {
            '../../theme.config$': path.join(__dirname, 'src/semantic/theme.config'),
          },
        },
      });
}