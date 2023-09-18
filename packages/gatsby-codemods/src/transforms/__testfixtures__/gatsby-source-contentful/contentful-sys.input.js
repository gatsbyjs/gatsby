const res1 = allContentfulPage.nodes.contentful_id
const res2 = allContentfulPage.nodes.sys.contentType.__typename
const { contentful_id, createdAt, updatedAt } = allContentfulPage.nodes
const { title, metaDescription, metaImage, content } = data.contentfulPage
const { foo } = result.data.allContentfulPage.nodes[0]
const {
  revision,
  sys: {
    contentType: { __typename },
  },
} = allContentfulPage.nodes
