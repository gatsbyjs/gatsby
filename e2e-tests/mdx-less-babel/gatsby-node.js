exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type Mdx implements Node {
      frontmatter: Frontmatter
    }
    type Frontmatter {
      title: String
    }
  `)
}
