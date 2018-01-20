const createAllQuery = (contentType, fieldsSubquery) => `
  {
    allContentful${contentType} {
      edges {
        node {
          ${fieldsSubquery}
        }
      }
    }
  }
`

const getNodesFromAllQuery = rootQueryType => ({ data }) => {
  const edges = data[rootQueryType].edges
  return edges.map(({ node }) => node)
}

const getNodesFor = contentType =>
  getNodesFromAllQuery(`allContentful${contentType}`)

module.exports = {
  createAllQuery,
  getNodesFor,
}
