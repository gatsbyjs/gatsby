const result = await graphql`{
  allContentfulContentTypePage(limit: 1000) {
    nodes {
      id
    }
  }
}`
