// exports.sourceNodes = () => {
//   console.log(`wat`)
// }
// exports.onCreateNode = ({ node, actions, getNode }) => {
//   if (node.internal.type === `Test`) {
//     const fromLMDB = getNode(node.id)

//     console.log({ node, fromLMDB })
//     actions.createNode({
//       id: `${node.id} << test child`,
//       parent: node.id,
//       internal: {
//         type: `TestChild`,
//         contentDigest: `wa`,
//       },
//     })
//   }
// }
