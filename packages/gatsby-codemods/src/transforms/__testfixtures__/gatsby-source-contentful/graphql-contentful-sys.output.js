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
        type
        contentType {
          name
        }
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
      type
      contentType {
        name
      }
    }
  }
  allContentfulContentTypePage(
    filter: {slug: {eq: "blog"}, sys: {locale: {eq: $locale}}}
    sort: {sys: {publishedAt: DESC}}
  ) {
    nodes {
      id
    }
  }
  contentfulContentTypePage(slug: {eq: "blog"}, sys: {locale: {eq: $locale}}) {
    id
  }
}`)
