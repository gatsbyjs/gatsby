// @todo const res1 = allContentfulPage.nodes.contentfulId
const {
  sys: {
    id: contentful_id,
    firstPublishedAt: createdAt,
    publishedAt: updatedAt
  }
} = allContentfulPage.nodes
// @todo const { sys: { contentType } } = allContentfulPage.nodes