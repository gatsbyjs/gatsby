const mysql = require(`mysql`)

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }, configOptions) => {
  const { createNode } = actions

  delete configOptions.plugins

  let credentials = {
    host: configOptions.credentials.host || `localhost`,
    user: configOptions.credentials.user || `root`,
    password: configOptions.credentials.password || ``,
    database: configOptions.credentials.database || `local`,
  }

  const connection = mysql.createConnection({ ...credentials })
  connection.connect()

  let queries = configOptions.queries.map((query) => new Promise((resolve, reject) => connection.query(query, (err, results, fields) => {
        if (err) reject(err)
        resolve(results)
      })))

  connection.end()

  const createNodeStructure = (query, index) => {
    const nodeId = credentials.database
    return Object.assign({}, query, {
      ...query,
      id: nodeId + index,
      parent: nodeId,
      children: [],
      internal: {
        type: `Queries`,
        content: query,
        contentDigest: createContentDigest(query),
      },
    })
  }

  return Promise.all(queries).then(result => {
    result.forEach((value, index) => {
      const nodeData = createNodeStructure(JSON.stringify(value), index)
      createNode(nodeData)
    })
  })
}
