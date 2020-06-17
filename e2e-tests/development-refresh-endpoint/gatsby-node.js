const path = require(`path`)
exports.createPages = async function createPages({
  actions: { createPage },
}) {
  
  createPage({
    path: `/page/`,
    component: path.resolve(`src/pages/page.js`),
  })
}
