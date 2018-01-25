const createAllQuery = (contentType, subQuery) => `
  {
    allContentful${contentType} {
      edges {
        node {
          ${subQuery || `id`}
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
