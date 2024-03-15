const result = await graphql(`{
  allContentfulContentTypePage(
    filter: {logo: {url: {ne: null}}}
    sort: [{sys: {firstPublishedAt: ASC}}, {logo: {fileName: ASC}}]
  ) {
    nodes {
      id
      logo {
        url
        fileName
        contentType
        size
        width
        height
      }
    }
  }
  allContentfulAsset(
    filter: {url: {ne: null}}
    sort: [{sys: {firstPublishedAt: ASC}}, {fileName: ASC}]
  ) {
    nodes {
      id
    }
  }
  contentfulAsset(url: {ne: null}) {
    id
  }
}`)
