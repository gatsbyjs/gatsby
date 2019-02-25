const NUM_PAGES = parseInt(process.env.NUM_PAGES || 5000, 10)
const template = require(`./page-template`)

const range = n => Array.from(Array(n).keys())

exports.sourceNodes = async ({ actions: { createNode } }) =>
  // Create markdown nodes
  Promise.all(
    range(NUM_PAGES).map(i =>
      createNode({
        id: i.toString(),
        parent: null,
        children: [],
        internal: {
          type: `FakeMarkdown`,
          mediaType: `text/markdown`,
          content: template(i),
          contentDigest: i.toString(),
        },
      })
    )
  )

exports.createPages = ({ actions: { createPage } }) =>
  Promise.all(
    range(NUM_PAGES).map(i =>
      createPage({
        path: `/path/${i}/`,
        component: require.resolve(`./src/templates/blank.js`),
        context: {
          id: i.toString(),
        },
      })
    )
  )
