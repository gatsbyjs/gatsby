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
        sys {
          type
          contentType {
            __typename
          }
        }
      }
    }
    contentfulPage {
      contentful_id
      node_locale
      createdAt
      updatedAt
      revision
      spaceId
      sys {
        type
        contentType {
          __typename
        }
      }
    }
    allContentfulPage(
      filter: { slug: { eq: "blog" }, node_locale: { eq: $locale } }
      sort: { updatedAt: DESC }
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
