const result = await graphql`
  {
    allContentfulPage(limit: 1000) {
      nodes {
        id
      }
    }
  }
`
