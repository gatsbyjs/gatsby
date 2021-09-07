const NUM_PAGES = parseInt(process.env.NUM_PAGES || 5000, 10)

const blankTemplate = require.resolve(`./src/templates/blank.js`)
exports.createPages = ({ actions: { createPage } }) => {
  for (let step = 0; step < NUM_PAGES; step++) {
    createPage({
      path: `/path/${step}/`,
      component: blankTemplate,
      context: {
        id: step,
      },
    })
  }
}
