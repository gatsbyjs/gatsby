import { graphql } from "gatsby"

import Note from "../components/note"

export default Note

export const pageQuery = graphql`
  query($id: String!) {
    note: mdx(id: { eq: $id }) {
      id
      body
    }
    site: site {
      siteMetadata {
        title
      }
    }
  }
`
