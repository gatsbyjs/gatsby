const capitalize = str => `${str[0].toUpperCase()}${str.slice(1)}`

const createAllQuery = (contentType, subQuery) => `
  {
    allContentful${capitalize(contentType)} {
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
  getNodesFromAllQuery(`allContentful${capitalize(contentType)}`)

module.exports = {
  createAllQuery,
  getNodesFor,
}
