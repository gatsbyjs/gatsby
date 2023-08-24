const result = await graphql(`
  {
    allContentfulPage(limit: 1000) {
      nodes {
        contentful_id
        customName: node_locale
        createdAt
        updatedAt
        revision
        spaceId
      }
    }
    contentfulPage {
      contentful_id
      node_locale
      createdAt
      updatedAt
      revision
      spaceId
    }
  }
`)
