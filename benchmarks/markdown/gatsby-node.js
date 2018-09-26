let NUM_PAGES = 5000

if (process.env.NUM_PAGES) {
  NUM_PAGES = process.env.NUM_PAGES
}

exports.sourceNodes = ({ actions: { createNode } }) => {
  // Create markdown nodes
  let step
  for (step = 0; step < NUM_PAGES; step++) {
    createNode({
      id: step.toString(),
      parent: null,
      children: [],
      internal: {
        type: `FakeMarkdown`,
        mediaType: `text/markdown`,
        content: `---\ntitle: "hi"\n---\nWhat up folks? This is _lit_\n\n##Page #${step}`,
        contentDigest: step.toString(),
      },
    })
  }
}

exports.createPages = ({ actions: { createPage } }) => {
  let step
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
