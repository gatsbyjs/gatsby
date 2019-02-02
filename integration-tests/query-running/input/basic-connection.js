module.exports = {
  name: `basic connection`,
  query: `
{
  allEntry {
    edges {
      node {
        id
        string
      }
    }
  }
}
  `,
}
