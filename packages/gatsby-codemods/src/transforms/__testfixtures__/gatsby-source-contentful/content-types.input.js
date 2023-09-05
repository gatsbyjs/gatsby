const demo = [
  ...data.allContentfulFoo.nodes,
  ...data.allContentfulBar.nodes,
]
const content = data.contentfulPage.content
const {
  data: {
    allContentfulTemplatePage: { nodes: templatePages },
  },
} = await graphql(``)