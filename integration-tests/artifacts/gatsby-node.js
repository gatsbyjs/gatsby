const path = require(`path`)
const fs = require(`fs-extra`)

let runNumber = parseInt(process.env.ARTIFACTS_RUN_SETUP, 10) || 1

let isFirstRun = runNumber === 1

let changedBrowserCompilationHash
let changedSsrCompilationHash
let regeneratedPages = []
let deletedPages = []
let stitchedPages = []
let renderedSlices = []

exports.onPreInit = ({ emitter, store }) => {
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

  emitter.on(`SLICES_PROPS_RENDERED`, action => {
    console.log(require(`util`).inspect(action.payload, { depth: Infinity }))
    renderedSlices.push(...action.payload)
  })

  // this is last step before stitching slice html into page html
  // we don't have action specific for stitching, so we just use this one
  // to read state that determine which page htmls will be stitched
  emitter.on(`SLICES_PROPS_REMOVE_STALE`, () => {
    stitchedPages = []

    for (const path of store.getState().html.pagesThatNeedToStitchSlices) {
      stitchedPages.push(path)
    }
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

  createNodeHelper(`SliceBlogPost`, {
    id: "blog-1",
    authorId: `kylem`,
    title: "What is Lorem Ipsum?",
    content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
    slug: "blog-1",
  })

  createNodeHelper(`SliceBlogPost`, {
    id: "blog-2",
    authorId: runNumber < 2 ? `joshj` : `kylem`,
    title: "Why do we use it?",
    content:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
    slug: "blog-2",
  })

  createNodeHelper(`SliceBlogPost`, {
    id: "blog-3",
    authorId: `joshj`,
    title: "Where does it come from?",
    content: `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

    The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.`,
    slug: "blog-3",
  })

  createNodeHelper(`SliceBlogPostAuthor`, {
    name: `Kyle Mathews`,
    id: `kylem`,
    summary:
      runNumber < 2
        ? `who lives and works in San Francisco building useful things(before edit)`
        : `who lives and works in San Francisco building useful things(after edit)`,
    twitter: `kylemathews`,
  })

  createNodeHelper(`SliceBlogPostAuthor`, {
    name: `Josh Johnson`,
    id: `joshj`,
    summary: `who lives and works in Michigan building neat things`,
    twitter: `0xJ05H`,
  })

  createNodeHelper(`SliceLayoutMetadata`, {
    id: `slice-metadata`,
    title:
      runNumber < 2
        ? `Gatsby Slice Test (before edit)`
        : `Gatsby Slice Test (after edit)`,
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

  actions.createSlice({
    id: `layout`,
    component: require.resolve(`./src/components/slices-layout`),
  })

  const authorResults = await graphql(
    `
      {
        allSliceBlogPostAuthor {
          nodes {
            id
          }
        }
      }
    `
  )

  for (const author of authorResults.data.allSliceBlogPostAuthor.nodes) {
    actions.createSlice({
      id: `bio--${author.id}`,
      component: require.resolve(`./src/components/slices-bio.js`),
      context: {
        id: author.id,
      },
    })
  }

  const blogResults = await graphql(
    `
      {
        allSliceBlogPost {
          nodes {
            id
            slug
            authorId
          }
        }
      }
    `
  )

  for (const post of blogResults.data.allSliceBlogPost.nodes) {
    actions.createPage({
      path: `/slices/${post.slug}`,
      component: require.resolve(
        `./src/templates/page-using-slices-details.js`
      ),
      context: {
        id: post.id,
      },
      slices: {
        // Instruct this blog page to use the matching bio slice
        // Any time the "bio" alias is seen, it'll use the "bio--${authorId}" slice
        bio: `bio--${post.authorId}`,
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
  stitchedPages = []
  renderedSlices = []
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
      generatedSlices: renderedSlices,
      removed: deletedPages,
      stitched: stitchedPages,
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
