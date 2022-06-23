import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout_1"

const Article = ({ children, pageContext, data }) => {
  console.log({ data })
  return (
    <Layout>
      <Link to="/">Go back to index page</Link>
      <div>
        <h1>{pageContext.frontmatter.title}</h1>
        {children}
      </div>
      <pre>
        <code>{JSON.stringify({ children, pageContext, data }, null, 2)}</code>
      </pre>
    </Layout>
  )
}

export const pageQuery = graphql`
  query BlogPostQuery($id: String!) {
    mdx(id: { eq: $id }) {
      id
      frontmatter {
        title
      }
    }
  }
`

export default Article
