const path = require(`path`)
const axios = require(`axios`)

exports.createPages = ({ actions }) => {
  const { createPage } = actions
  return new Promise((resolve, reject) => {
    axios
      .get(`https://bvaughn.github.io/js-search/books.json`)
      .then(result => {
        const { data } = result
        /**
         * creates a page dynamic page with the data received
         * injects the data received into the context object alongside with some options
         * to configure js-search
         */
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
