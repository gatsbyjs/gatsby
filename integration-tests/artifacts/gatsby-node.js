const path = require(`path`)
const fs = require(`fs-extra`)

const runNumber = parseInt(process.env.ARTIFACTS_RUN_SETUP, 10) || 1

const isFirstRun = runNumber === 1

exports.sourceNodes = ({ actions, createContentDigest, reporter, getNode }) => {
  reporter.info(`Using test setup #${runNumber}`)

  function createNodeHelper(type, nodePartial) {
    const node = {
      template: `default`,
      ...nodePartial,
      internal: {
        type,
        contentDigest: createContentDigest(nodePartial),
      },
    }
    actions.createNode(node)
  }

  for (let prevRun = 1; prevRun < runNumber; prevRun++) {
    const node = getNode(`node-created-in-run-${prevRun}`)
    if (node) {
      actions.touchNode(node)
    }
  }
  createNodeHelper(`NodeCounterTest`, {
    id: `node-created-in-run-${runNumber}`,
    label: `Node created in run ${runNumber}`,
  })
}

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

let counter = 1
exports.onPostBuild = ({ getNodes }) => {
  console.log(`[test] onPostBuild`)

  fs.writeJSONSync(
    path.join(
      process.cwd(),
      `.cache`,
      `build-manifest-for-test-${counter++}.json`
    ),
    {
      allNodeCounters: getNodes().map(node => [node.id, node.internal.counter]),
    }
  )
}
