// @todo const res1 = allContentfulPage.nodes.contentfulId
const { contentful_id, createdAt, updatedAt } = allContentfulPage.nodes
const { title, metaDescription, metaImage, content } = data.contentfulPage
const { foo } = result.data.allContentfulPage.nodes[0]
// @todo const { sys: { contentType } } = allContentfulPage.nodes