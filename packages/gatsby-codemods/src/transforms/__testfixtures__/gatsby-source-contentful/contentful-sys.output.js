// @todo const res1 = allContentfulPage.nodes.contentfulId
const {
  sys: {
    id: contentful_id,
    firstPublishedAt: createdAt,
    publishedAt: updatedAt
  }
} = allContentfulPage.nodes
const { title, metaDescription, metaImage, content } = data.contentfulContentTypePage
const { foo } = result.data.allContentfulContentTypePage.nodes[0]
// @todo const { sys: { contentType } } = allContentfulPage.nodes