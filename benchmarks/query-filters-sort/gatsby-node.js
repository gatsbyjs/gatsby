const NUM_PAGES = parseInt(process.env.NUM_PAGES || 1000, 10)
const NUM_NODES = parseInt(process.env.NUM_NODES || NUM_PAGES, 10)
const SORT = process.env.SORT
const FILTER = process.env.FILTER || `eq`
const COUNT = Boolean(process.env.COUNT) && process.env.COUNT !== `0`
const TEXT = Boolean(process.env.TEXT) && process.env.TEXT !== `0`

if (NUM_NODES < NUM_PAGES) {
  throw new Error("Expecting NUM_NODES >= NUM_PAGES")
}

const nodesPerPage = Math.max(1, Math.round(NUM_NODES / NUM_PAGES))
const ptop = require(`process-top`)()

exports.createSchemaCustomization = ({ actions }) => {
  console.log(`createSchemaCustomization!`, process.env.GATSBY_WORKER_ID)
  actions.createTypes(`
    type Test implements Node @dontInfer {
      id: ID!
      nodeNum: Int!
      nodeNumStr: String!
      pageNum: Int!
      pageNumStr: String!
      fooBar: String!
      fooBar2: String!
      fooBarArray: [TestFooBarArray!]
      text: String!
      random: Int!
      randomPage: Int!
    }
    type TestFooBarArray {
      fooBar: String!
    }
    type SitePage implements Node @dontInfer {
      id: ID!
    }
  `)
}

exports.sourceNodes = async ({ actions: { createNode } }) => {
  setTimeout(mem, 1000)
  console.log(`Creating ${NUM_NODES} nodes`)
  for (let nodeNum = 0; nodeNum < NUM_NODES; nodeNum++) {
    const pageNum = Math.floor(nodeNum / nodesPerPage)
    createNode({
      id: String(nodeNum),
      nodeNum,
      nodeNumStr: String(nodeNum),
      pageNum,
      pageNumStr: String(pageNum),
      fooBar: [`foo`, `bar`, `baz`, `foobar`][nodeNum % 4],
      fooBar2: [`foo`, `bar`, `baz`, `foobar`][pageNum % 4],
      fooBarArray: [
        { fooBar: [`foo`, `bar`, `baz`, `foobar`][nodeNum % 4] },
        { fooBar: [`bar`, `baz`, `foobar`, `foo`][nodeNum % 4] },
      ],
      text: TEXT ? randomStr(4128) : `${nodeNum}`,
      random: Math.round(Math.random() * NUM_NODES),
      randomPage: Math.round(Math.random() * NUM_PAGES),
      internal: {
        type: `Test`,
        contentDigest: String(nodeNum),
      },
    })
    if (nodeNum % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 3))
    }
    if (nodeNum % 10000 === 0) {
      console.log(`Created ${nodeNum} nodes`)
    }
  }
  if (global.gc) {
    global.gc()
  }
  console.log(ptop.toString())
}

const pageTemplate = require.resolve(`./src/templates/${FILTER}.js`)
exports.createPages = async ({ actions: { createPage } }) => {
  console.log(
    `Creating ${NUM_PAGES} pages for filter: ${FILTER} (SORT: ${
      SORT || `0`
    }, COUNT: ${COUNT || `0`})`
  )
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
        pageNumPlus1000: pageNum + 1000,
        pageNumStr: String(pageNum),
        limit: nodesPerPage,
        skip: nodesPerPage * pageNum,
        nodesTotal: NUM_NODES,
        pagesTotal: NUM_PAGES,
        sort:
          !SORT || SORT === `0`
            ? undefined
            : {
                fields:
                  SORT === `1`
                    ? ["random"]
                    : SORT.split(`,`).map(f => f.trim()),
              },
        count: COUNT,
        fooBarRegex: `/${[`foo`, `bar`, `baz`, `foobar`][pageNum % 4]}/`,
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

function mem() {
  if (global.gc) {
    global.gc()
  }
  console.log(ptop.toString())
  setTimeout(mem, 10 * 1000)
}
