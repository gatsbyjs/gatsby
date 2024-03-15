const result = await graphql(`
  {
    allContentfulPage(
      filter: { logo: { file: { url: { ne: null } } } },
      sort: [{createdAt: ASC}, {logo: {file: {fileName: ASC}}}]
    ) {
      nodes {
        id
        logo {
          file {
            url
            fileName
            contentType
            details {
              size
              image {
                width
                height
              }
            }
          }
        }
      }
    }
    allContentfulAsset(
      filter: {file: { url: { ne: null } }},
      sort: [{createdAt: ASC}, {file: {fileName: ASC}}]
    ) {
      nodes {
        id
      }
    }
    contentfulAsset(file: { url: { ne: null } }) {
      id
    }
  }
`)
