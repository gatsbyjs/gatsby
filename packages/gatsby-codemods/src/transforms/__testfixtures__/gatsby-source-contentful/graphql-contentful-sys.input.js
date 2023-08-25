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
    allContentfulPage(
      filter: { slug: { eq: "blog" }, node_locale: { eq: $locale } }
    ) {
      nodes {
        id
      }
    }
    contentfulPage(slug: { eq: "blog" }, node_locale: { eq: $locale }) {
      id
    }
  }
`)
