const NUM_PAGES = parseInt(process.env.NUM_PAGES || 1000, 10)
const NUM_NODES = parseInt(process.env.NUM_NODES || NUM_PAGES, 10)
const SORT = process.env.SORT
const FILTER = process.env.FILTER || `eq`
const TEXT = Boolean(process.env.TEXT)

if (NUM_NODES < NUM_PAGES) {
  throw new Error("Expecting NUM_NODES >= NUM_PAGES")
}

const nodesPerPage = Math.max(1, Math.round(NUM_NODES / NUM_PAGES))
const ptop = require(`process-top`)()

exports.sourceNodes = async ({ actions: { createNode } }) => {
  console.log(`Creating ${NUM_NODES} nodes`)
  for (let nodeNum = 0; nodeNum < NUM_NODES; nodeNum++) {
    const pageNum = Math.floor(nodeNum / nodesPerPage)
    createNode({
      id: String(nodeNum),
      nodeNum,
      pageNum,
      nodeNumReversed: NUM_NODES - nodeNum,
      testEq: String(nodeNum),
      testIn: [`foo`, `bar`, `baz`, `foobar`][nodeNum % 4],
      testElemMatch: [
        { testIn: [`foo`, `bar`, `baz`, `foobar`][nodeNum % 4] },
        { testEq: String(nodeNum) },
      ],
      text: `${TEXT ? new Array(4128).join("*") : ``}${nodeNum}`,
      sortRandom: Math.random() * NUM_NODES,
      internal: {
        type: `Test`,
        contentDigest: String(nodeNum),
      },
    })
    if (nodeNum % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 3))
    }
  }
  if (global.gc) {
    global.gc()
  }
  console.log(ptop.toString())
}

const pageTemplate = require.resolve(`./src/templates/${FILTER}.js`)
exports.createPages = async ({ actions: { createPage } }) => {
  console.log(`Creating ${NUM_PAGES} pages for filter: ${FILTER}`)
  for (let pageNum = 0; pageNum < NUM_PAGES; pageNum++) {
    createPage({
      path: `/path/${pageNum}/`,
      component: pageTemplate,
      context: {
        pageNumAsStr: String(pageNum),
        fooBarValues: [
          [`foo`, `bar`, `baz`, `foobar`][pageNum % 4],
          [`foo`, `bar`, `baz`, `foobar`][(pageNum + 1) % 4],
        ],
        intValue: pageNum,
        pageNum: pageNum,
        pagesLeft: NUM_PAGES - pageNum,
        limit: nodesPerPage,
        skip: nodesPerPage * pageNum,
        nodesTotal: NUM_NODES,
        pagesTotal: NUM_PAGES,
        sort: SORT
          ? { fields: ["sortRandom"], order: SORT === `1` ? `ASC` : `DESC` }
          : undefined,
        regex: `/^${String(pageNum).slice(0, 1)}/`, // node id starts with the same number as page id
      },
    })
    if (pageNum % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 3))
    }
  }
  if (global.gc) {
    global.gc()
  }
  console.log(ptop.toString())
}

exports.onPostBuild = () => {
  if (global.gc) {
    global.gc()
  }
  console.log(ptop.toString())
}
