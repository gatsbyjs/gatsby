// const {
//   takeHeapSnapshot,
// } = require(`./node_modules/gatsby/dist/utils/debug-memory.js`)

// exports.createSchemaCustomization = ({ actions }) => {
//   actions.createTypes(`
//     type Test implements Node @dontInfer {
//       id: ID!
//       nodeNum: Int!
//       nodeNumStr: String!
//       pageNum: Int!
//       pageNumStr: String!
//       fooBar: String!
//       fooBar2: String!
//       fooBarArray: [TestFooBarArray!]
//       text: String!
//       random: Int!
//       randomPage: Int!
//     }
//     type TestFooBarArray {
//       fooBar: String!
//     }
//     type SitePage implements Node @dontInfer {
//       id: ID!
//     }
//   `)
// }
const NUM_NODES = 200

exports.sourceNodes = async ({ actions }) => {
  // await takeHeapSnapshot(`sourceNodes-1`)

  for (let i = 0; i < NUM_NODES; i++) {
    const largeSizeObj = {}
    for (let j = 1; j <= 1024; j++) {
      largeSizeObj[`key_${j}`] = `x`.repeat(1024)
    }

    const node = {
      id: `memory-${i}`,
      idClone: `memory-${i}`,
      fooBar: [`foo`, `bar`, `baz`, `foobar`][i % 4],
      number1: 5,
      number2: 7,
      largeSizeObj,
      largeSizeString: `x`.repeat(1024 * 1024),
      internal: {
        contentDigest: `hash`, // we won't be changing nodes so this can be hardcoded
        type: `Test`,
      },
    }

    actions.createNode(node)

    if (i % 100 === 99) {
      await new Promise(resolve => setImmediate(resolve))
    }
  }

  await new Promise(resolve => setTimeout(resolve, 100))

  // await takeHeapSnapshot(`sourceNodes-2`)
}

// exports.onCreateNode = ({ node, actions, getNode }) => {
//   if (node.internal.type === `TestChild`) {
//     const grandpa = getNode(node.parent)
//     console.log({ grandpa })

//     actions.createNode({
//       id: `${node.id} << test child2`,
//       parent: node.id,
//       internal: {
//         type: `TestGrandChild`,
//         contentDigest: `wa`,
//       },
//     })
//   }
// }

exports.createPages = async ({ getNode, action, graphql }) => {
  debugger

  const node = getNode(`memory-1`)
  // console.log({ node })
  // console.info(`just using node`, node.id)
  // await takeHeapSnapshot(`create-pages`)
}
