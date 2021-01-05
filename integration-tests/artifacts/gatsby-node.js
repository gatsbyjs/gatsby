const isFirstRun = process.env.RUN_FOR_STALE_PAGE_ARTIFICATS !== `2`

exports.createPages = ({ actions }) => {
  function createPageHelper(dummyId) {
    actions.createPage({
      path: `/stale-pages/${dummyId}`,
      component: require.resolve(`./src/templates/dummy`),
      context: {
        dummyId,
      },
    })
  }

  // stable page that always gets created
  createPageHelper(`stable`)

  if (isFirstRun) {
    // page exists in first run, but not in second
    createPageHelper(`only-in-first`)
  } else {
    // page exists only in second run
    createPageHelper(`only-in-second`)
  }
}
