const result = await graphql(`{
  allContentfulContentTypePage(limit: 1000) {
    nodes {
      sys {
        id
        customName: locale
        firstPublishedAt
        publishedAt
        publishedVersion
        spaceId
      }
    }
  }
  contentfulContentTypePage {
    sys {
      id
      locale
      firstPublishedAt
      publishedAt
      publishedVersion
      spaceId
    }
  }
}`)
