const demo = [
  ...data.allContentfulContentTypeFoo.nodes,
  ...data.allContentfulContentTypeBar.nodes,
]
const content = data.contentfulContentTypePage.content
const {
  data: {
    allContentfulContentTypeTemplatePage: { nodes: templatePages },
  },
} = await graphql(``)