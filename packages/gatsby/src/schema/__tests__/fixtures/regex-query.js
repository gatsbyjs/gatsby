exports.query = `{
  allMarkdown(filter: { frontmatter: { authors: { elemMatch: { email: { regex: "/^\\w{6}\\d@\\w{7}\\.COM$/i" } } } } }) {
    nodes {
      frontmatter {
        authors {
          email
        }
      }
    }
  }
}`
