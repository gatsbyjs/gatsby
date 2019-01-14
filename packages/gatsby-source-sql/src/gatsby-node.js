const knex = require(`knex`)

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  configOptions
) => {
  const { createNode } = actions
  const { typeName, fieldName, dbEngine, queryChain } = configOptions

  const fieldNodeId = createNodeId(`gatsby-sql-field-${fieldName}`)
  createNode({
    id: fieldNodeId,
    typeName: typeName,
    fieldName: fieldName,
    parent: null,
    children: [],
    internal: {
      type: `SQLSource`,
      contentDigest: createContentDigest({ fieldName, typeName }),
      ignoreType: true,
    },
  })

  // Process Queried Row
  const processQueryRow = (queryRow, rowIndex) => {
    const nodeContent = JSON.stringify(queryRow)
    const nodeData = Object.assign({}, queryRow, {
      id: queryRow.id
        ? queryRow.id
        : createNodeId(`gatsby-sql-type-${fieldName}-${typeName}-${rowIndex}`),
      parent: null,
      children: [],
      internal: {
        type: typeName,
        content: nodeContent,
        contentDigest: createContentDigest(queryRow),
      },
    })

    return nodeData
  }

  try {
    const data = await queryChain(knex(dbEngine))

    data.forEach((row, rowIndex) => {
      const nodeData = processQueryRow({ ...row }, rowIndex)
      // console.log(nodeData)
      createNode(nodeData)
    })
  } catch (error) {
    console.error(error)
  }

  return
}
