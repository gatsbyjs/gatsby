const res1 = allContentfulPage.nodes.sys.id
const res2 = allContentfulPage.nodes.sys.contentType.name
const {
  sys: {
    id: contentful_id,
    firstPublishedAt: createdAt,
    publishedAt: updatedAt
  }
} = allContentfulPage.nodes
const { title, metaDescription, metaImage, content } = data.contentfulContentTypePage
const { foo } = result.data.allContentfulContentTypePage.nodes[0]
const {
  sys: {
    publishedVersion: revision,
    contentType: { name }
  }
} = allContentfulPage.nodes
