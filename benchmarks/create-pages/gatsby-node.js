let NUM_PAGES = 5000

if (process.env.NUM_PAGES) {
  NUM_PAGES = process.env.NUM_PAGES
}

exports.createPages = ({ actions: { createPage } }) => {
  var step
  for (step = 0; step < NUM_PAGES; step++) {
    createPage({
      path: `/path/${step}/`,
      component: require.resolve(`./src/templates/blank.js`),
      context: {
        id: step,
      },
    })
  }
}
