const result = await graphql(`{
  allContentfulTag(sort: {fields: contentful_id}) {
    nodes {
      name
      contentful_id
    }
  }
  allContentfulContentTypeNumber(
    sort: {fields: contentful_id}
    filter: {contentfulMetadata: {tags: {elemMatch: {contentful_id: {eq: "numberInteger"}}}}}
  ) {
    nodes {
      title
      integer
      contentfulMetadata {
        tags {
          name
          contentful_id
        }
      }
    }
  }
}`)
