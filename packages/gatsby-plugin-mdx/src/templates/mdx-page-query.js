import { graphql } from "gatsby"
import MdxPage from "../components/mdx-page"

export default MdxPage

export const query = graphql`
  query GatsbyMdxPageQuery($id: String!) {
    mdx(id: { eq: $id }) {
      body
    }
  }
`
