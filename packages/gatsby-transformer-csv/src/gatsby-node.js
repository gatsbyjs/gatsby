const Promise = require(`bluebird`)
const csv = require(`csvtojson`)
const _ = require(`lodash`)
const crypto = require(`crypto`)

const convertToJson = (data, options) =>
  new Promise((res, rej) => {
    csv(options)
      .fromString(data)
      .on(`end_parsed`, jsonData => {
        if (!jsonData) {
          rej(`CSV to JSON conversion failed!`)
        }
        res(jsonData)
      })
  })

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId },
  options
) {
  const { createNode, createParentChildLink } = actions
  // Filter out non-csv content
  if (node.extension !== `csv`) {
    return
  }
  // Load CSV contents
  const content = await loadNodeContent(node)
  // Parse
  let parsedContent = await convertToJson(content, options)

  if (_.isArray(parsedContent)) {
    const csvArray = parsedContent.map((obj, i) => {
      const objStr = JSON.stringify(obj)
      const contentDigest = crypto
        .createHash(`md5`)
        .update(objStr)
        .digest(`hex`)

      return {
        ...obj,
        id: obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> CSV`),
        children: [],
        parent: node.id,
        internal: {
          contentDigest,
          // TODO make choosing the "type" a lot smarter. This assumes
          // the parent node is a file.
          // PascalCase
          type: _.upperFirst(_.camelCase(`${node.name} Csv`)),
        },
      }
    })

    _.each(csvArray, y => {
      createNode(y)
      createParentChildLink({ parent: node, child: y })
    })
  }

  return
}

exports.onCreateNode = onCreateNode
