const result = await graphql(`
  {
    allContentfulTag(sort: { fields: contentful_id }) {
      nodes {
        name
        contentful_id
      }
    }
    allContentfulNumber(
      sort: { fields: contentful_id }
      filter: {
        metadata: {
          tags: { elemMatch: { contentful_id: { eq: "numberInteger" } } }
        }
      }
    ) {
      nodes {
        title
        integer
        metadata {
          tags {
            name
            contentful_id
          }
        }
      }
    }
  }
`)
