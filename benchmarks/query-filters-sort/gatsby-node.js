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

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type Test implements Node @dontInfer {
      id: ID!
      nodeNum: Int!
      pageNum: Int!
      unique: String!
      fooBar: String!
      fooBarArray: [TestFooBarArray!]
      text: String!
      random: Float
    }
    type TestFooBarArray {
      fooBar: String!
    }
  `)
}

exports.sourceNodes = async ({ actions: { createNode } }) => {
  console.log(`Creating ${NUM_NODES} nodes`)
  for (let nodeNum = 0; nodeNum < NUM_NODES; nodeNum++) {
    const pageNum = Math.floor(nodeNum / nodesPerPage)
    createNode({
      id: String(nodeNum),
      nodeNum,
      pageNum,
      unique: String(nodeNum),
      fooBar: [`foo`, `bar`, `baz`, `foobar`][nodeNum % 4],
      fooBarArray: [
        { fooBar: [`foo`, `bar`, `baz`, `foobar`][nodeNum % 4] },
        { fooBar: [`bar`, `baz`, `foobar`, `foo`][nodeNum % 4] },
      ],
      text: TEXT ? randomStr(4128) : `${nodeNum}`,
      random: Math.random() * NUM_NODES,
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
        fooBarArray: [
          [`foo`, `bar`, `baz`, `foobar`][pageNum % 4],
          [`foo`, `bar`, `baz`, `foobar`][(pageNum + 1) % 4],
        ],
        fooBar: [`foo`, `bar`, `baz`, `foobar`][pageNum % 4],
        pageNum: pageNum,
        pagesLeft: NUM_PAGES - pageNum,
        limit: nodesPerPage,
        skip: nodesPerPage * pageNum,
        nodesTotal: NUM_NODES,
        pagesTotal: NUM_PAGES,
        sort: SORT
          ? {
            fields: SORT === `fooBar` ? ["fooBar", "random"] : ["random"],
          }
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

function randomStr(length) {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let str = []
  for (let i = 0; i < length; i++) {
    str.push(chars.charAt(Math.floor(Math.random() * chars.length)))
  }
  return str.join(``)
}
