module.exports = {
  name: `basic sort`,
  query: `
{
  allEntry(sort:{fields:[sortField]}) {
    edges {
      node {
        id
        string
        sortField
      }
    }
  }
}
  `,
}
