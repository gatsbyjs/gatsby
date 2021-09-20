const path = require(`path`)
const fs = require(`fs-extra`)

let runNumber = parseInt(process.env.ARTIFACTS_RUN_SETUP, 10) || 1

let isFirstRun = runNumber === 1

let changedBrowserCompilationHash
let changedSsrCompilationHash
let regeneratedPages = []
let deletedPages = []

exports.onPreInit = ({ emitter }) => {
  emitter.on(`SET_WEBPACK_COMPILATION_HASH`, action => {
    changedBrowserCompilationHash = action.payload
  })

  emitter.on(`SET_SSR_WEBPACK_COMPILATION_HASH`, action => {
    changedSsrCompilationHash = action.payload
  })

  emitter.on(`HTML_GENERATED`, action => {
    for (const path of action.payload) {
      regeneratedPages.push(path)
    }
  })

  emitter.on(`HTML_REMOVED`, action => {
    deletedPages.push(action.payload)
  })
}

let previouslyCreatedNodes = new Map()
let didRemoveTrailingSlashForTestedPage = false

exports.sourceNodes = ({
  actions,
  createContentDigest,
  webhookBody,
  reporter,
  getNode,
}) => {
  if (webhookBody && webhookBody.runNumber) {
    runNumber = webhookBody.runNumber
    isFirstRun = runNumber === 1
  }

  reporter.info(`Using test setup #${runNumber}`)

  const currentlyCreatedNodes = new Map()

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
    currentlyCreatedNodes.set(node.id, node)
  }

  // used to create pages and queried by them
  createNodeHelper(`DepPageQuery`, {
    id: `page-query-stable`,
    label: `Stable (always created)`,
  })

  // used to create pages and queried by them
  createNodeHelper(`DepPageQuery`, {
    id: `page-query-stable-alternative`,
    label: `Stable (always created)`,
    // this is just so we always create at least one page with alternative template to avoid changing compilation hash (async-requires change) (sigh: we should be able to mark module as template even without any pages to avoid that warning)
    template: `alternative`,
  })

  createNodeHelper(`DepPageQuery`, {
    id: `page-query-template-change`,
    label: `Stable (always created)`,
    // use default template in first run, but alternative in next ones
    template: runNumber <= 1 ? `default` : `alternative`,
  })

  createNodeHelper(`DepPageQuery`, {
    id: `page-query-changing-but-not-invalidating-html`,
    label: `Stable (always created)`,
    buildRun: runNumber, // important for test setup - this will invalidate page queries, but shouldn't invalidate html (if it's not queried)
  })

  createNodeHelper(`DepPageQuery`, {
    id: `page-query-changing-data-but-not-id`,
    label: `This is${isFirstRun ? `` : ` not`} a first run`, // this will be queried - we want to invalidate html here
  })

  createNodeHelper(`DepPageQuery`, {
    id: `page-query-dynamic-${runNumber}`, // this should cause different page path
    label: `This is run number {$runNumber}`,
  })

  // used by static queries
  createNodeHelper(`DepStaticQuery`, {
    id: `static-query-stable`,
    label: `Stable (always created)`,
  })

  createNodeHelper(`DepStaticQuery`, {
    id: `static-query-changing-but-not-invalidating-html`,
    label: `Stable (always created)`,
    buildRun: runNumber, // important for test setup - this will invalidate static query, but shouldn't invalidate html (if it's not queried)
  })

  createNodeHelper(`DepStaticQuery`, {
    id: `static-query-changing-data-but-not-id`,
    label: `This is${isFirstRun ? `` : ` not`} a first run`, // this will be queried - we want to invalidate html here
  })

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

  for (const prevNode of previouslyCreatedNodes.values()) {
    if (!currentlyCreatedNodes.has(prevNode.id)) {
      actions.deleteNode({ node: prevNode })
    }
  }
  previouslyCreatedNodes = currentlyCreatedNodes
}

exports.createPages = async ({ actions, graphql }) => {
  // testing if expected html/page-data files exist OR don't exist (if stale artifacts are removed)
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
    // page exists only in first run
    createPageHelper(`only-in-first`)
  } else {
    // page exists in any run other than first
    createPageHelper(`only-not-in-first`)
  }

  createPageHelper(
    `sometimes-i-have-trailing-slash-sometimes-i-dont${
      runNumber % 2 === 0 ? `/` : ``
    }`
  )

  actions.createPage({
    path: `/changing-context/`,
    component: require.resolve(`./src/templates/dummy`),
    context: {
      dummyId: `runNumber: ${runNumber}`,
    },
  })

  const { data } = await graphql(`
    {
      allDepPageQuery {
        nodes {
          id
          template
        }
      }
    }
  `)

  for (const depPageQueryNode of data.allDepPageQuery.nodes) {
    actions.createPage({
      path: `/${depPageQueryNode.id}/`,
      component:
        depPageQueryNode.template === `alternative`
          ? require.resolve(`./src/templates/deps-page-query-alternative`)
          : require.resolve(`./src/templates/deps-page-query`),
      context: {
        id: depPageQueryNode.id,
      },
    })
  }
}

exports.createPagesStatefully = async ({ actions }) => {
  if (runNumber !== 3) {
    actions.createPage({
      path: `/stateful-page-not-recreated-in-third-run/`,
      component: require.resolve(`./src/templates/dummy`),
      context: {
        dummyId: `stateful-page`,
      },
    })
  }
}

exports.onPreBuild = () => {
  console.log(`[test] onPreBuild`)
  changedBrowserCompilationHash = `not-changed`
  changedSsrCompilationHash = `not-changed`
  regeneratedPages = []
  deletedPages = []
}

let counter = 1
exports.onPostBuild = async ({ graphql, getNodes }) => {
  console.log(`[test] onPostBuild`)

  if (!didRemoveTrailingSlashForTestedPage) {
    throw new Error(
      `Test setup failed - didn't remove trailing slash for /pages-that-will-have-trailing-slash-removed/ page`
    )
  }

  const { data } = await graphql(`
    {
      allSitePage(filter: { path: { ne: "/dev-404-page/" } }) {
        nodes {
          path
        }
      }
    }
  `)

  fs.writeJSONSync(
    path.join(
      process.cwd(),
      `.cache`,
      `build-manifest-for-test-${counter++}.json`
    ),
    {
      allNodeCounters: getNodes().map(node => [node.id, node.internal.counter]),
      allPages: data.allSitePage.nodes.map(node => node.path),
      changedBrowserCompilationHash,
      changedSsrCompilationHash,
      generated: regeneratedPages,
      removed: deletedPages,
    }
  )
}

// simulating "gatsby-plugin-remove-trailing-slashes" scenario
exports.onCreatePage = ({ page, actions }) => {
  if (page.path === `/page-that-will-have-trailing-slash-removed/`) {
    actions.deletePage(page)
    actions.createPage({
      ...page,
      path: `/page-that-will-have-trailing-slash-removed`,
    })
    didRemoveTrailingSlashForTestedPage = true
  }
}
