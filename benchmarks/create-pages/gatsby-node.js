const NUM_PAGES = process.env.NUM_PAGES || 5000

const range = n => Array.from(Array(n).keys())

exports.createPages = ({ actions: { createPage } }) =>
  Promise.all(
    range(NUM_PAGES).map(id =>
      createPage({
        path: `/path/${id}/`,
        component: require.resolve(`./src/templates/blank.js`),
        context: {
          id: id,
        },
      })
    )
  )
