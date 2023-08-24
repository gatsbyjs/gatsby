const result = await graphql(`{
  allContentfulContentTypePage(filter: {logo: {url: {ne: null}}}) {
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
  allContentfulAsset(filter: {url: {ne: null}}) {
    nodes {
      id
    }
  }
  contentfulAsset(url: {ne: null}) {
    id
  }
}`)
