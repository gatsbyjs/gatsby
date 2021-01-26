const NUM_PAGES = parseInt(process.env.NUM_PAGES || 5000, 10)

const component = require.resolve(`./src/templates/blank.js`)
exports.createPages = ({ actions: { createPage } }) => {
  for (let step = 0; step < NUM_PAGES; step++) {
    createPage({
      path: `/path/${step}/`,
      component,
      context: {
        id: step,
      },
    })
  }
}
